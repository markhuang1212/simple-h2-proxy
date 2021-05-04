import http2 from 'http2'
import net from 'net'
import Pino from 'pino'
import config from './config'
import fs from 'fs'
import { TLSSocket } from 'tls'
import path from 'path'
import { getuid, setgid, setuid } from 'process'

const indexHTML = fs.readFileSync(path.join(__dirname, '../static/index.html'), 'utf-8')

const server = http2.createSecureServer({
    key: fs.readFileSync(config.key),
    cert: fs.readFileSync(config.cert),
    requestCert: true,
    rejectUnauthorized: false,
    ca: fs.readFileSync(config.ca)
})


const log = Pino()

server.on('stream', (stream, headers) => {

    const authorized = (stream.session.socket as TLSSocket).authorized

    if (headers[':method'] === 'CONNECT') {

        if (!authorized) {
            log.info({
                source: stream.session.socket.remoteAddress
            }, `Unauthorized access`)
            stream.close(400)
            return
        }

        const auth = new URL(`tcp://${headers[':authority']}`)
        log.info({
            source: stream.session.socket.remoteAddress,
            user: (stream.session.socket as TLSSocket).getPeerCertificate().subject.CN,
            destination: `${auth.hostname}:${auth.port}`
        }, '')
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

        log.info(`visit from ${stream.session.socket.remoteAddress}`)
        stream.respond({
            'content-type': 'text/html; charset=utf-8',
            ':status': 200
        })
        stream.end(indexHTML)

    }
})

server.on('sessionError', err => {
    log.info(err, 'local server error')
})

server.listen(config.server_port, () => {
    log.info(`Server started on port ${config.server_port}`)
    if (getuid() === 0) {
        if (process.platform === 'darwin') {
            setgid('nobody')
        }
        if (process.platform === 'linux') {
            setgid('nogroup')
        }
        setuid('nobody')
        log.info('privileges downgraded')
    }
})

process.on('uncaughtException', err => {
    log.error(err, 'Unhandled Exception')
})