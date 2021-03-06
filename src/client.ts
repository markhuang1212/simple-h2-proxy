/**
 * Convert HTTP/2 proxy to HTTP/1. For legacy usages
 * Its current performance is NOT good.
 */

require('../.pnp.js')

import http, { IncomingMessage } from 'http'
import http2 from 'http2'
import { Duplex } from 'stream'
import config from './config'
import fs from 'fs'
import path from 'path'

if (process.env.HOST === undefined) {
    console.log('No HOST specified. Exiting')
    process.exit(1)
}

const pac = fs.readFileSync(path.join(__dirname, '../static/proxy.pac'))

const server = http.createServer((req, res) => {
    console.log(`Receive HTTP request to ${req.url}`)
    if (req.url === '/proxy.pac') {
        res.setHeader('Content-Type', 'application/x-ns-proxy-autocnfig')
        res.write(pac)
        res.end()
    } else {
        res.statusCode = 404
        res.end()
    }
})

const cert = fs.readFileSync(config.cert, 'utf-8')
const key = fs.readFileSync(config.key, 'utf-8')

server.on('connect', async (req: IncomingMessage, clientSocket: Duplex, head: Buffer) => {
    const { port, hostname } = new URL(`tcp://${req.url}`)
    console.log(`Receive CONNECT request to ${req.url}`)

    const session = http2.connect('https://' + config.host!, { key, cert })

    session.on('error', (err) => {
        console.error('Session error')
        console.error(err.stack)
    })

    session.on('frameError', err => {
        console.error('Session error')
        console.error(err.stack)
    })

    const stream = session.request({
        ':method': 'CONNECT',
        ':authority': hostname + ':' + port
    })

    stream.on('response', (headers) => {
        clientSocket.write(`HTTP/1.1 200 Connection Established \r\n`
            + `Proxy-agent: Node.js-Proxy\r\n` + `\r\n`)
        console.log(`Connection with ${req.url} established`)
        stream.write(head)
        stream.pipe(clientSocket)
        clientSocket.pipe(stream)
    })

    stream.on('error', err => {
        console.error('Stream error')
        console.error(err.stack)
        session.close()
    })

    stream.on('frameError', err => {
        console.error('Stream Frame error')
        console.error(err.stack)
        session.close()
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
    console.log('Client is listening at port ' + config.client_port)
})
