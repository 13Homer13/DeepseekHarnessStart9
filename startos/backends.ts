import * as fs from 'node:fs/promises'
import { FileHelper, T, z } from '@start9labs/start-sdk'
import {
  apiHostId as llamaCppHostId,
  apiPort as llamaCppPort,
} from 'llama-cpp-startos/startos/utils'
import {
  port as ollamaPort,
  apiHostId as ollamaHostId,
} from 'ollama-startos/startos/utils'
import {
  apiHostId as strataHostId,
  apiPort as strataPort,
} from 'strata-startos/startos/utils'
import {
  apiHostId as vllmHostId,
  apiPort as vllmPort,
} from 'vllm-startos/startos/utils'
import type { StoredModel } from './fileModels/store.json'
import { sdk } from './sdk'

/**
 * The StartOS model servers the Connect Model Servers action can wire into
 * dsh. Each one is reached over the service bridge at its OpenAI-compatible
 * `/v1` API and becomes an optional dependency while connected. Adding a server
 * is one entry here plus its dependency description.
 */
export type KnownBackend = {
  /** StartOS package id */
  id: string
  title: string
  /** The dependency's host id and the internal port of the binding we dial. */
  hostId: string
  internalPort: number
  /** Lowest version whose bridge address and key work the way we dial them. */
  versionRange: string
  /** The dependency's health check that must pass while connected. */
  healthCheck: string
  /**
   * `public`: the server requires its API key, read from
   * `<id>:public/credentials.json`. `none`: no key on the bridge; dsh still
   * needs a non-empty one, so it gets {@link PLACEHOLDER_API_KEY}.
   */
  keySource: 'public' | 'none'
  icon: string
}

export const KNOWN_BACKENDS: KnownBackend[] = [
  {
    id: 'strata',
    title: 'Strata',
    hostId: strataHostId,
    internalPort: strataPort,
    versionRange: '>=0.1.41:0',
    healthCheck: 'primary',
    keySource: 'public',
    icon: 'https://raw.githubusercontent.com/13Homer13/strata-startos/master/icon.svg',
  },
  {
    id: 'llama-cpp',
    title: 'llama.cpp',
    hostId: llamaCppHostId,
    internalPort: llamaCppPort,
    // The keyless release: the API key moved to the StartOS proxy, so the
    // bridge address needs none.
    versionRange: '>=1.0.9994:1',
    healthCheck: 'primary',
    keySource: 'none',
    icon: 'https://raw.githubusercontent.com/Start9Labs/llama-cpp-startos/master/icon.png',
  },
  {
    id: 'vllm',
    title: 'vLLM',
    hostId: vllmHostId,
    internalPort: vllmPort,
    versionRange: '>=0.23.1-rc.0:13',
    healthCheck: 'primary',
    keySource: 'public',
    icon: 'https://raw.githubusercontent.com/Start9Labs/vllm-startos/master/icon.svg',
  },
  {
    id: 'ollama',
    title: 'Ollama',
    hostId: ollamaHostId,
    internalPort: ollamaPort,
    versionRange: '>=0.31.2:2',
    healthCheck: 'primary',
    keySource: 'none',
    icon: 'https://raw.githubusercontent.com/Start9Labs/ollama-startos/master/icon.svg',
  },
]

export const PLACEHOLDER_API_KEY = 'no-key-required'

/** dsh provider route for a backend: a lowercase hyphenated id. */
export const routeName = (b: KnownBackend) => `startos-${b.id}`

/** The env var dsh resolves the route's key from (`apiKeyEnv`). */
export const apiKeyEnv = (b: KnownBackend) =>
  `STARTOS_${b.id.toUpperCase().replace(/-/g, '_')}_API_KEY`

/** The installed known backends, in registry order. */
export async function detectInstalled(
  effects: T.Effects,
): Promise<KnownBackend[]> {
  const installed = new Set(await effects.getInstalledPackages())
  return KNOWN_BACKENDS.filter((b) => installed.has(b.id))
}

/**
 * `http://<bridge address>/v1`, or null while the backend isn't installed.
 * `const` in main, so an install, uninstall, or port change heals with one
 * restart; `once` in an action.
 */
export async function resolveBaseUrl(
  effects: T.Effects,
  b: KnownBackend,
  mode: 'const' | 'once',
): Promise<string | null> {
  const addr = await sdk.host
    .getBridgeAddress(effects, {
      packageId: b.id,
      hostId: b.hostId,
      internalPort: b.internalPort,
      ssl: false,
    })
    [mode]()
  return addr === null ? null : `http://${addr}/v1`
}

// A dependency's public volume is bind-mounted under our startos volume, which
// is not backed up, so its key never lands in this service's backups.
const publicCredentials = (packageId: string) =>
  FileHelper.json(
    `${sdk.volumes.startos.subpath(`${packageId}-public`)}/credentials.json`,
    z.looseObject({ apiKey: z.string().catch('') }),
  )

/**
 * The API key a backend publishes, or null if it can't be read (not installed,
 * too old to publish one, file missing). `const` restarts main when the
 * backend rotates its key.
 */
export async function readPublicApiKey(
  effects: T.Effects,
  packageId: string,
  mode: 'const' | 'once',
): Promise<string | null> {
  try {
    const location = sdk.volumes.startos.subpath(`${packageId}-public`)
    // The mount effect unmounts and remounts an existing mount, which would
    // pull the file out from under main's watcher, so mount only when needed.
    const mounted = await fs
      .access(`${location}/credentials.json`)
      .then(() => true)
      .catch(() => false)
    if (!mounted) {
      await fs.mkdir(location, { recursive: true })
      await effects.mount({
        location,
        target: {
          packageId,
          volumeId: 'public',
          subpath: null,
          readonly: true,
          idmap: [],
        },
      })
    }
    const read = publicCredentials(packageId).read((c) => c.apiKey)
    return (
      (await (mode === 'const' ? read.const(effects) : read.once())) || null
    )
  } catch {
    return null
  }
}

/** The key dsh sends to a backend, or null when a required one is missing. */
export async function backendKey(
  effects: T.Effects,
  b: KnownBackend,
  mode: 'const' | 'once',
): Promise<string | null> {
  return b.keySource === 'public'
    ? readPublicApiKey(effects, b.id, mode)
    : PLACEHOLDER_API_KEY
}

const asCtx = (v: unknown) =>
  typeof v === 'number' && Number.isInteger(v) && v > 0 ? v : undefined

/**
 * The models a backend serves right now, from its `/v1/models`. Context sizes
 * come from the listing (Strata's `meta.n_ctx`, vLLM's `max_model_len`) or
 * else `/props` (llama.cpp's running context); Ollama reports neither.
 */
export async function discoverModels(
  baseUrl: string,
  key: string,
): Promise<StoredModel[]> {
  const headers = { Authorization: `Bearer ${key}` }
  const res = await fetch(`${baseUrl}/models`, {
    headers,
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`GET ${baseUrl}/models: HTTP ${res.status}`)
  const body = (await res.json()) as { data?: unknown }
  const rows = Array.isArray(body.data) ? body.data : []

  const models: StoredModel[] = []
  for (const row of rows as Record<string, any>[]) {
    // Strata lists each alias as a copy of its model; one entry is enough.
    if (typeof row?.id !== 'string' || row.alias_of) continue
    const modalities = row.architecture?.input_modalities
    models.push({
      id: row.id,
      contextWindow: asCtx(row.meta?.n_ctx) ?? asCtx(row.max_model_len),
      image: Array.isArray(modalities) && modalities.includes('image'),
    })
  }

  if (models.some((m) => m.contextWindow === undefined)) {
    const props = await fetch(`${baseUrl.replace(/\/v1$/, '')}/props`, {
      headers,
      signal: AbortSignal.timeout(10_000),
    })
      .then((r) => (r.ok ? (r.json() as Promise<Record<string, any>>) : null))
      .catch(() => null)
    const ctx =
      asCtx(props?.default_generation_settings?.n_ctx) ?? asCtx(props?.n_ctx)
    if (ctx) for (const m of models) m.contextWindow ??= ctx
  }
  return models
}

/**
 * The dsh provider route (`@deepseek-ai/dsh-llm-pi-ai` profile) for a
 * connected backend. `compat` pins the request shape every one of these
 * servers accepts: `max_tokens`, a `system` role, and no `store` field.
 */
export function providerRoute(
  b: KnownBackend,
  baseURL: string,
  models: readonly StoredModel[],
) {
  return {
    displayName: `${b.title} (StartOS)`,
    api: 'openai-completions',
    baseURL,
    apiKeyEnv: apiKeyEnv(b),
    compat: {
      maxTokensField: 'max_tokens',
      supportsDeveloperRole: false,
      supportsStore: false,
    },
    // pi-ai's own fallbacks are 256K / 32K, which a smaller server refuses.
    defaultContextWindow: 32768,
    defaultMaxTokens: 8192,
    models: models.map((m) => ({
      id: m.id,
      ...(m.contextWindow
        ? {
            contextWindow: m.contextWindow,
            // A quarter of the context for the reply, at most 32K.
            maxTokens: Math.min(32768, Math.floor(m.contextWindow / 4)),
          }
        : {}),
      input: m.image ? ['text', 'image'] : ['text'],
    })),
  }
}
