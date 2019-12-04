const http = require('http')
const app = require('./app')
const config = require('./config')
const redis = require('socket.io-redis')

const server = http.createServer(app) // server

app.io.attach(server) // attach server to socket
app.io.origins([config.ORIGINS]) // Origin socket config

// using adapter to pass event between nodes
app.io.adapter(redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT
}))

server.listen(config.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${config.PORT}`);
})
