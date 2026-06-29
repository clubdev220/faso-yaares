const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'

// Hostinger/LiteSpeed passes socket path via HOSTNAME env var
// e.g. HOSTNAME = "usr/local/lsws/extapp-sock/domain:_.sock" (no leading slash)
const hostnameEnv = process.env.HOSTNAME || ''
const portEnv = process.env.PORT || '3000'

const isSocket = hostnameEnv.includes('.sock')
const socketPath = isSocket ? ('/' + hostnameEnv) : null
const tcpPort = parseInt(portEnv, 10) || 3000

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  if (isSocket && socketPath) {
    // Remove stale socket file from previous deploy
    try { fs.unlinkSync(socketPath) } catch (e) {}

    server.listen(socketPath, () => {
      // LiteSpeed needs read/write access to the socket
      try { fs.chmodSync(socketPath, '777') } catch (e) {}
      console.log(`> Ready on Unix socket: ${socketPath}`)
    })

    server.on('error', (err) => {
      console.error('Server error:', err)
      process.exit(1)
    })
  } else {
    server.listen(tcpPort, '0.0.0.0', () => {
      console.log(`> Ready on http://0.0.0.0:${tcpPort}`)
    })

    server.on('error', (err) => {
      console.error('Server error:', err)
      process.exit(1)
    })
  }
})
