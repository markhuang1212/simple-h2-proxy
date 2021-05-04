import http2 from 'http2'
import net from 'net'
import Pino from 'pino'
import config from './config'
import fs from 'fs'
import { TLSSocket } from 'node:tls'

const server = http2.createSecureServer({
    key: fs.readFileSync(config.key),
    cert: fs.readFileSync(config.cert),
    requestCert: true,
    ca: config.ca.map(path => fs.readFileSync(path))
})
const log = Pino()

server.on('stream', (stream, headers) => {
    const authorized = (stream.session.socket as TLSSocket).authorized
    if (headers[':method'] === 'CONNECT') {
        if (!authorized) {
            stream.close(400)
            return
        }
        const auth = new URL(`tcp://${headers[':authority']}`)
        const socket = net.connect(parseInt(auth.port), auth.hostname, () => {
            stream.respond()
            socket.pipe(stream)
            stream.pipe(socket)
        })
        socket.on('error', err => {
            log.info(err, 'remote socket error')
            stream.close(http2.constants.NGHTTP2_CONNECT_ERROR)
        })
    }
    else {
        
    }
})

server.on('error', err => {
    log.info(err, 'local server error')
})