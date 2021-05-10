/**
 * @file
 * 
 * The default configuration is saved in this file.
 * 
 * @author hm
 * @license MIT
 * 
 */

import { env } from "process"

class Config {

    host = env.HOST
    key = '/etc/h2-proxy/key.pem'
    cert = '/etc/h2-proxy/cert.pem'
    ca = '/etc/h2-proxy/ca.pem'

    server_port = 443
    client_port = 9000
}

const config = new Config

export default config