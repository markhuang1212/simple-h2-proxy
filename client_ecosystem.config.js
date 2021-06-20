module.exports = {
  apps : [{
    name: 'h2-proxy-client',
    script: './dist/client.js',
    env: {
      HOST: 'h2.hmplayground.dev'
    },
    env_production: {
      HOST: 'h2.hmplayground.dev'
    }
  }]
};
