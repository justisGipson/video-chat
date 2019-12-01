const config = require('../server/config')

let namespace;
const users = {
    general: [],
    sports: [],
    games: []
};

const onConnection = (socket) => {
    // join room event listener
    socket.on('joinRoom', ({username, room}) => {
        socket.join(room, () => {
            users[room].push({ username: username, privateChat: false }) // push user for suitable room
            namespace.in(room).emit('newUser', users[room]) // notify all users in room
        })
    })
}

exports.createNameSpace = (io) => {
    namespace = io
        .of(config.CHAT_NAMESPACE)
        .on('connection', onConnection)
}
