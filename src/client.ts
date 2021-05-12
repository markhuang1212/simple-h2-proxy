/**
 * Convert HTTP/2 proxy to HTTP/1. For legacy usages
 * Its current performance is NOT good.
 */

import http, { IncomingMessage } from 'http'
import http2 from 'http2'
import { Duplex } from 'stream'
import config from './config'
import fs from 'fs'

const server = http.createServer()

const cert = fs.readFileSync(config.cert, 'utf-8')
const key = fs.readFileSync(config.key, 'utf-8')

server.on('connect', async (req: IncomingMessage, clientSocket: Duplex, head: Buffer) => {
    const { port, hostname } = new URL(`tcp://${req.url}`)
    console.log(`Receive CONNECT request to ${req.url}`)

    const session = http2.connect('https://' + config.host!, { key, cert })

    const stream = session.request({
        ':method': 'CONNECT',
        ':authority': hostname + ':' + port
    })

    stream.on('response', (headers) => {
        if (headers[':status'] === 200) {
            clientSocket.write(`HTTP/1.1 200 Connection Established \r\n`
                + `Proxy-agent: Node.js-Proxy\r\n` + `\r\n`)
            stream.write(head)
            stream.pipe(clientSocket)
            clientSocket.pipe(stream)
        } else {
            clientSocket.write(`HTTP/1.1 400 Internal Error\r\n` + `\r\n`)
            if (!stream.closed)
                stream.close()
            if (!clientSocket.destroyed)
                clientSocket.destroy()
        }
    })

    stream.on('close', () => {
        session.close()
    })

})

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception!!!')
    console.error(err.stack)
})

server.listen(config.client_port, () => {
    console.log('Client is listening')
})