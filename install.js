// this script create a systemd file and copy it to your /etc/systemd/system folder

const fs = require('fs')
const path = require('path')

const file = `# Installation Time: ${new Date().toUTCString()}

[Unit]
Description=Simple HTTP2 Proxy

[Service]
ExecStart=/usr/bin/node -r ${path.join(__dirname, '.pnp.js')} ${path.join(__dirname, 'dist/server.js')}
Restart=always
WorkingDirectory=${__dirname}

[Install]
WantedBy=multi-user.target
`

fs.writeFile('/etc/systemd/system/h2-proxy.service', file, (err) => {
    if (err) {
        console.error(`Installation Failed. ${err}`)
    } else {
        console.log('Installation Success')
    }
})
