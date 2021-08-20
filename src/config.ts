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

    /**
     * The host to which the client will connect
     */
    host = env.HOST

    /**
     * Client/Server SSL Key
     */
    key = '/etc/h2-proxy/key.pem'

    /**
     * Client/Server SSL Certificate
     */
    cert = '/etc/h2-proxy/cert.pem'

    /**
     * CA For client authentication
     */
    ca = '/etc/h2-proxy/ca.pem'

    server_port = 443
    client_port = 9000
}

const config = new Config

export default config