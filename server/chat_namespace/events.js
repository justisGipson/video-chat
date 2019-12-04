const ChatRedis = require('../redis')

const changeStatus = (socket, namespace) => ({ username, status, room   }) => {
    console.log(`user ${username} wants to change their status to ${status}`)

    ChatRedis.getUser(room, socket.id)
        .then(user => ChatRedis.setUser(room, socket.id, {...user, status}))
        .then(() => ChatRedis.getUsers(room))
        .then(users => {
            if (users === null) return

            // notify all users in same room
            namespace.in(room).emit('newUser', {users, username})
        })
}

const publicMessage = (namespace) => ({ room, username, message }) => {
    namespace.in(room).emit('newMessage', {
        message,
        username
    })
}

const leaveRoom = (socket, namespace) => ({ room, username }) => {
    console.log(`user ${username} want to leave the room ${room}`)

    ChatRedis.delUser(room, socket.id)
        .then(data => {
            if (data === null) return null
            return ChatRedis.getUsers(room)
        })
        .then(users => {
            if (users === null) return null

            // notify all users in same room
            namespace.in(room).emit('newUser', {users, username})

            // exit socket
            socket.leave(room, () => {
                console.log(`user ${username} has left the room ${room}`)
            })
        })
}

const leaveChat = (socket, namespace) => ({ room, username }) => {
    console.log(`user ${username} wants to leave the chat`)

    ChatRedis.delUser(room, socket.id)
        .then(data => {
            if (data === null) return null
            return ChatRedis.getUsers(room)
        })
        .then(users => {
            if (users === null) return

            // notify all users in same room
            namespace.in(room).emit('leaveChat', {users, username})

            //exit socket
            socket.leave(room, () => {
                console.log(`user ${username} has left the room ${room}`)
            })
        })
}

const joinPrivateRoom = (socket, namespace) => ({username, room, to}) => {
    console.log(`user ${username} wants to open a private chat with ${to}`)
    // join room
    socket.join(to, () => {
        if (room !== null) {
            ChatRedis.getUser(room, socket.id)
                .then(user => {
                    if (user === null) return null
                    // if user is already talking
                    if (user.privateChat) {
                        namespace.to(to).emit('leavePrivateRoom', {
                            to,
                            privateMessage: `${to} is already talking`,
                            from: username,
                            room
                        })
                        socket.leave(room, () => {
                            console.log(`user ${username} left the chat with ${to}`)
                        })
                        return null
                    }

                    return ChatRedis.setUser(room, socket.id, {
                        ...user,
                        privateChat: true
                    })
                })
                .then(res => {
                    if (res === null) return

                    namespace.in(room).emit('privateChat', {
                        username,
                        to
                    })
                })
            }
        })
}

const leavePrivateRoom = (socket, namespace) => ({ room, to, from }) => {
    console.log(`user ${from} wants to leave the private chat with ${to}`)

    ChatRedis.getUser(room, socket.id)
        .then(user => {
            if (user === null) return

            return ChatRedis.setUser(room, socket.id, {
                ...user,
                privateChat: false
            })
        })
        .then(res => {
            if (res === null) return

            namespace.to(to).emit('leaveProvateRoom', {
                to,
                privateMessage: `${to} has closed the chat`,
                from
            })
            socket.leave(to, () => {
                console.log(`user ${from} has left the chat with ${to}`)
            })
        })
}

const privateMessage = (namespace) => ({ privateMessage, to, from, room}) => {
    console.log(`user ${from} wants to send a message to ${to}`)

    // private messsage to user
    namespace.to(to).emit('privateMessage', {to, privateMessage, from, room})
}

const privateMessagePCSignaling = (namespace) => ({ desc, to, from, room}) => {
    console.log(`user ${from} sends an offer to ${to}`)

    // private signaling to user
    namespace.to(room).emit('privateMessagePCSignaling', {desc, to, from})
}


module.exports = {
    changeStatus,
    publicMessage,
    leaveRoom,
    joinPrivateRoom,
    leavePrivateRoom,
    privateMessage,
    privateMessagePCSignaling,
    leaveChat
}
