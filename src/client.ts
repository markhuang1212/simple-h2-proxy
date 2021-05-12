/**
 * Convert HTTP/2 proxy to HTTP/1. For legacy usages
 */

import http, { IncomingMessage } from 'http'
import http2 from 'http2'
import { env } from 'process'
import { Duplex } from 'stream'
import config from './config'
import fs from 'fs'

const server = http.createServer()

const cert = fs.readFileSync(config.cert, 'utf-8')
const key = fs.readFileSync(config.key, 'utf-8')

let session: http2.ClientHttp2Session | undefined

function waitForSession(session: http2.ClientHttp2Session) {
    return new Promise<void>((res, rej) => {
        session.on('connect', () => {
            res()
        })
        if (session.connecting == false) {
            res()
        }
    })
}

function initializeSession() {

    session = http2.connect(`https://${env.HOST}`, {
        cert, key
    })

    session.on('error', (err: Error) => {
        console.log('session error')
        console.log(err)
        if (session && session.closed)
            session.close()
    })

    session.on('frameError', (err: Error) => {
        console.error('session frame error')
        console.log(err)
        if (session && !session.closed)
            session.close()
    })

    session.on('close', () => {
        console.log('session closed')
    })

}

server.on('connect', async (req: IncomingMessage, clientSocket: Duplex, head: Buffer) => {
    const { port, hostname } = new URL(`tcp://${req.url}`)
    console.log(`Receive CONNECT request to ${req.url}`)

    if (session === undefined || session.closed || session.destroyed) {
        initializeSession()
    }

    await waitForSession(session!)

    const stream = session!.request({
        ':method': 'CONNECT',
        ':authority': hostname + ':' + port
    })

    stream.on('error', (err: Error) => {
        console.error('stream error')
        console.log(err.stack)
        if (!stream.closed)
            stream.close()
        if (!clientSocket.destroyed)
            clientSocket.destroy()
    })

    stream.on('frameError', (err: Error) => {
        console.log('stream frame error')
        console.log(err.stack)
        if (!stream.closed)
            stream.close()
        if (!clientSocket.destroyed)
            clientSocket.destroy()
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

})

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception!!!')
    console.log(err.stack)
})

server.listen(config.client_port, () => {
    console.log('Client is listening')
})