import {
  apiKeyEnv,
  backendKey,
  KNOWN_BACKENDS,
  providerRoute,
  resolveBaseUrl,
  routeName,
} from './backends'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { dshPort, proxyPort, webuiHostId, webuiInterfaceId } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting DeepSeek Harness'))

  // dsh fences its /api routes on the Host header. It cannot know the address
  // the user enabled, so hand it every hostname this interface answers to and
  // let the fence do its job; the daemon restarts when that set changes.
  const trustedHosts = await sdk.host
    .getOwn(effects, webuiHostId, (host) => {
      const iface =
        host &&
        Object.values(host.bindings)
          .flatMap((b) => Object.values(b.interfaces))
          .find((i) => i.id === webuiInterfaceId)
      return iface
        ? [...new Set(iface.addressInfo.hostnames.map((h) => h.hostname))]
        : []
    })
    .const()

  // The model servers Connect Model Servers connected, as dsh provider routes.
  // The entrypoint writes them into dsh's own provider config before dsh
  // starts; keys travel only as env vars the routes name. A server that is
  // uninstalled or has no key yet is left out until it heals.
  const connected =
    (await storeJson.read((s) => s.backends).const(effects)) ?? {}
  const providers: Record<string, ReturnType<typeof providerRoute>> = {}
  const keyEnv: Record<string, string> = {}
  for (const b of KNOWN_BACKENDS) {
    const models = connected[b.id]?.models
    if (!models?.length) continue
    const baseUrl = await resolveBaseUrl(effects, b, 'const')
    const key = baseUrl && (await backendKey(effects, b, 'const'))
    if (!baseUrl || !key) continue
    providers[routeName(b)] = providerRoute(b, baseUrl, models)
    keyEnv[apiKeyEnv(b)] = key
  }

  return sdk.Daemons.of(effects).addDaemon('webui', {
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'main' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      }),
      'webui',
    ),
    exec: {
      command: ['/app/webui-entrypoint.sh'],
      env: {
        PROXY_PORT: String(proxyPort),
        DSH_WEB_PORT: String(dshPort),
        DSH_TRUSTED_HOSTS: trustedHosts
          .map((h) => (h.includes(':') ? `[${h}]` : h))
          .join(' '),
        DSH_HOME: '/data/dsh',
        STARTOS_PROVIDERS: JSON.stringify(providers),
        ...keyEnv,
      },
    },
    ready: {
      display: i18n('Web Interface'),
      gracePeriod: 120_000,
      trigger: sdk.trigger.cooldownTrigger(10_000),
      fn: async () => {
        // web-proxy answers 502 while dsh is still booting; once dsh is up,
        // a bare request gets its sign-in 401, which still means "serving".
        const res = await fetch(`http://localhost:${proxyPort}/`).catch(
          () => null,
        )
        return !res || res.status === 502
          ? {
              result: 'failure',
              message: i18n('The web interface is not responding yet'),
            }
          : {
              result: 'success',
              message: i18n('The web interface is ready'),
            }
      },
    },
    requires: [],
  })
})
