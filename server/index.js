const http = require('http')
const app = require('./app')
const config = require('./config')
const server = http.createServer(app)

app.io.attach(server) // attach server to socket
app.io.origins([config.ORIGINS]) // Origin socket config

server.listen(config.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${config.PORT}`);
})
