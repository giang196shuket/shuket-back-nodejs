module.exports = {
    apps: [{
        name: 'SHUKET',
        script: 'bin/www',
        instances: 5,
        exec_mode: 'cluster',
        listen_timeout: 30000,
        kill_timeout: 3000
    }]
}

// "start": "pm2 start service.config.js",
