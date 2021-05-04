import { getuid } from "process"

class Config {

    key = '/etc/h2-proxy/key.pem'
    cert = '/etc/h2-proxy/cert.pem'

    ca = '/etc/h2-proxy/ca.pem'

    server_port = 443
    client_port = 8080
}

const config = new Config

export default config