const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')

// Log env at startup — appears immediately so we know the process ran
console.log('[yaare] server.js starting')
console.log('[yaare] NODE_ENV:', process.env.NODE_ENV)
console.log('[yaare] PORT:', process.env.PORT)
console.log('[yaare] HOSTNAME:', process.env.HOSTNAME)

const dev = process.env.NODE_ENV !== 'production'
const portEnv = process.env.PORT || '3000'
const hostnameEnv = process.env.HOSTNAME || ''

// Hostinger/LiteSpeed passes socket path via HOSTNAME
// e.g. "usr/local/lsws/extapp-sock/domain:_.sock" (no leading slash)
const isSocket = hostnameEnv.includes('.sock')
const socketPath = isSocket ? ('/' + hostnameEnv) : null
const tcpPort = parseInt(portEnv, 10) || 3000

console.log('[yaare] Mode:', isSocket ? ('socket → ' + socketPath) : ('TCP → 0.0.0.0:' + tcpPort))

const app = next({ dev })
const handle = app.getRequestHandler()

function startServer(server) {
  if (isSocket && socketPath) {
    const dir = path.dirname(socketPath)
    try { fs.mkdirSync(dir, { recursive: true }) } catch (e) {
      console.log('[yaare] mkdir warning:', e.message)
    }
    try { fs.unlinkSync(socketPath) } catch (e) {
      console.log('[yaare] unlink warning (ok if not exists):', e.message)
    }

    server.listen(socketPath, () => {
      try { fs.chmodSync(socketPath, '777') } catch (e) {
        console.log('[yaare] chmod warning:', e.message)
      }
      console.log('[yaare] Ready on Unix socket:', socketPath)
    })

    server.on('error', (err) => {
      console.error('[yaare] Socket error, falling back to TCP:', err.message)
      server.removeAllListeners('error')
      server.listen(tcpPort, '0.0.0.0', () => {
        console.log('[yaare] Ready on TCP (fallback): http://0.0.0.0:' + tcpPort)
      })
      server.on('error', (err2) => {
        console.error('[yaare] TCP error:', err2)
        process.exit(1)
      })
    })
  } else {
    server.listen(tcpPort, '0.0.0.0', () => {
      console.log('[yaare] Ready on http://0.0.0.0:' + tcpPort)
    })
    server.on('error', (err) => {
      console.error('[yaare] TCP error:', err)
      process.exit(1)
    })
  }
}

app.prepare()
  .then(() => {
    console.log('[yaare] Next.js prepared, creating HTTP server')
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('[yaare] Request error:', req.url, err)
        res.statusCode = 500
        res.end('internal server error')
      }
    })
    startServer(server)
  })
  .catch((err) => {
    console.error('[yaare] Failed to prepare Next.js:', err)
    process.exit(1)
  })
