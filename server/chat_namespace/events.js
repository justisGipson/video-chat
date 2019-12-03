const ChatRedis = require('../redis')

const changeStatus = (socket, namespace) => ({ username, status, room   }) => {
    console.log(`user ${username} wants to change their status to ${status}`)

    ChatRedis.getUser(room, socket.id)
        .then(user => ChatRedis.setUser(room, socket.id, {...user, status}))
        .then(() => ChatRedis.getUsers(room))
        .then(users => {
            if (users === null) return

            namespace.in(room).emit('newUser', {users, username})
        })
}

module.exports = {
    changeStatus,
    
}
