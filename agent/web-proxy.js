// HTTP + WebSocket relay: 0.0.0.0:$PROXY_PORT -> 127.0.0.1:$TARGET_PORT
//
// dsh web binds loopback only, which the StartOS reverse proxy cannot reach —
// it dials the container's bridge address. This relay is the one hop between
// the two. Headers pass through untouched: dsh fences its own /api routes on
// the Host header, and the daemon is started with the authorities this
// interface actually answers to (DSH_TRUSTED_HOSTS).
//
// Three things are added on top, all because the browser is never on
// loopback here (the StartOS basic-auth gate in front is the real login):
// - Sign-in: dsh answers 401 to a browser without its session cookie and
//   expects the user to open the token URL it printed at startup. A page
//   navigation that gets that 401 is redirected to `/?token=…` instead, using
//   the token the entrypoint saved, and dsh's own exchange sets the cookie.
//   dsh exchanges the token only on `/` and then lands on `./`, so a deep link
//   ends up on the home page. A request that already carried a token gets the
//   401 as is, so a stale one can't loop.
//   Only for a Host in DSH_TRUSTED_HOSTS: dsh serves its index to any Host,
//   so without that check a rebound page could read the token.
// - That cookie is rewritten from SameSite=Strict to Lax. StartOS opens the
//   interface from its dashboard, a cross-site navigation, and a Strict
//   cookie set in that chain is withheld on the next hop — the exchange would
//   loop. Lax still keeps it off cross-site subrequests.
// - Every HTML page gets `__DSH_TRANSPORT__ = {ownsHost: true}`. dsh's browser
//   code treats a non-loopback page as untrusted and hides Settings (the Models
//   page included) behind memory-only storage; this flag is its own switch
//   for "this page owns the Host".
//
// Realtime notes (the chat only renders live events over WS/SSE):
// - upgrades use Node's parsed headers (no raw-buffer surgery)
// - requestTimeout/headersTimeout are disabled so long-lived streams
//   are never killed mid-conversation

const fs = require('node:fs')
const http = require('node:http')
const net = require('node:net')

const PROXY_PORT = Number(process.env.PROXY_PORT || 4201)
const TARGET_HOST = '127.0.0.1'
const TARGET_PORT = Number(process.env.TARGET_PORT || 4200)
const TOKEN_FILE = process.env.DSH_TOKEN_FILE || '/run/dsh-launch-token'

const OWNS_HOST_SCRIPT =
  '<script>globalThis.__DSH_TRANSPORT__={ownsHost:true}</script>'

// The hostnames this interface answers to; the token is handed out on no other.
const TRUSTED = new Set(
  (process.env.DSH_TRUSTED_HOSTS || '').split(/\s+/).filter(Boolean),
)

const wantsHtml = (req) =>
  req.method === 'GET' && /\btext\/html\b/.test(req.headers.accept || '')

function carriesToken(req) {
  try {
    return new URL(req.url, 'http://relay.invalid').searchParams.has('token')
  } catch {
    return true
  }
}

function trustedHost(req) {
  try {
    return TRUSTED.has(new URL(`http://${req.headers.host}`).hostname)
  } catch {
    return false
  }
}

function launchToken() {
  try {
    return fs.readFileSync(TOKEN_FILE, 'utf8').trim() || null
  } catch {
    return null
  }
}

function laxCookies(setCookie) {
  if (!setCookie) return setCookie
  return setCookie.map((c) =>
    /^dsh-auth-/.test(c)
      ? c.replace(/;\s*SameSite=Strict/i, '; SameSite=Lax')
      : c,
  )
}

const server = http.createServer((req, res) => {
  res.socket?.setNoDelay(true)

  const html = wantsHtml(req)
  const headers = { ...req.headers }
  // Pages are rewritten below, so ask dsh for them uncompressed.
  if (html) delete headers['accept-encoding']

  const upstreamReq = http.request(
    {
      hostname: TARGET_HOST,
      port: TARGET_PORT,
      path: req.url,
      method: req.method,
      headers,
    },
    (upstreamRes) => {
      const status = upstreamRes.statusCode || 502
      const resHeaders = { ...upstreamRes.headers }
      resHeaders['set-cookie'] = laxCookies(resHeaders['set-cookie'])
      if (!resHeaders['set-cookie']) delete resHeaders['set-cookie']

      const token =
        html && status === 401 && !carriesToken(req) && trustedHost(req)
          ? launchToken()
          : null
      if (token) {
        upstreamRes.resume()
        res.writeHead(303, {
          'cache-control': 'no-store',
          'referrer-policy': 'no-referrer',
          location: `/?token=${encodeURIComponent(token)}`,
        })
        res.end()
        return
      }

      const isHtml = /\btext\/html\b/.test(resHeaders['content-type'] || '')
      if (!isHtml || resHeaders['content-encoding']) {
        res.writeHead(status, resHeaders)
        res.flushHeaders() // don't buffer SSE/event-stream responses
        upstreamRes.pipe(res)
        return
      }

      const chunks = []
      upstreamRes.on('data', (c) => chunks.push(c))
      upstreamRes.on('end', () => {
        const page = Buffer.concat(chunks).toString('utf8')
        const body = page.replace(
          /<head[^>]*>/i,
          (tag) => tag + OWNS_HOST_SCRIPT,
        )
        delete resHeaders['transfer-encoding']
        resHeaders['content-length'] = Buffer.byteLength(body)
        res.writeHead(status, resHeaders)
        res.end(body)
      })
      upstreamRes.on('error', () => res.destroy())
    },
  )
  upstreamReq.on('error', (err) => {
    console.error(`[web-proxy] upstream error: ${err.message}`)
    if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'text/plain' })
    res.end('web-proxy: upstream unavailable')
  })
  req.pipe(upstreamReq)
})

// WebSocket upgrades: replay Node's parsed headers to the upstream, forward the
// pre-parsed body chunk, then splice both pipes.
server.on('upgrade', (req, socket, head) => {
  socket.setNoDelay(true)
  const upstream = net.connect(TARGET_PORT, TARGET_HOST)
  upstream.setNoDelay(true)

  upstream.on('connect', () => {
    const lines = [`${req.method} ${req.url} HTTP/1.1`]
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) value.forEach((v) => lines.push(`${key}: ${v}`))
      else lines.push(`${key}: ${value}`)
    }
    upstream.write(lines.join('\r\n') + '\r\n\r\n')
    if (head && head.length > 0) upstream.write(head)

    socket.pipe(upstream)
    upstream.pipe(socket)
    socket.resume() // flush anything Node buffered past the handshake
  })

  const cleanup = () => {
    socket.destroy()
    upstream.destroy()
  }
  socket.on('error', cleanup)
  upstream.on('error', (err) => {
    console.error(`[web-proxy] ws upstream error: ${err.message}`)
    cleanup()
  })
  socket.on('close', cleanup)
  upstream.on('close', cleanup)
})

// Long-lived conversations must never be cut by Node's defaults.
server.requestTimeout = 0
server.headersTimeout = 60_000
server.keepAliveTimeout = 120_000

server.on('error', (err) => {
  console.error(`[web-proxy] server error: ${err.message}`)
  process.exit(1)
})

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(
    `[web-proxy] http+ws 0.0.0.0:${PROXY_PORT} -> ${TARGET_HOST}:${TARGET_PORT}`,
  )
})
