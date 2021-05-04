# simple-h2-proxy

A NodeJS Implementation of HTTP2 proxy server. Feature

* HTTP2 proxy
* TLS Authentication

As its name implies, it is simple.

## Development & Installation

```bash
git clone https://github.com/markhuang1212/simple-h2-proxy
cd simple-h2-proxy

# Typescript -> Javascript
yarn run build

# Put the necessary file to the following place
touch /etc/h2-proxy/cert.pem
touch /etc/h2-proxy/key.pem
touch /etc/h2-proxy/ca.pem

# Install systemd server
sudo node ./install.js
sudo systemctl start h2-proxy
sudo systemctl enable h2-proxy

```