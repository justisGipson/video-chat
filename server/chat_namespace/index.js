const config = require('../config')
const events = require('../events.js')
const ChatRedis = require('../redis')

let namespace;

const onConnection = (socket) => {
    // join room event listener
    console.log(`Socket is connected on port ${config.PORT}`)

    let userRoom;
    //listening for joining room
    socket.on('joinRoom', ({ username, room, status }) => {
        console.log(`${username} wants to join the room`)
        // join room
        socket.join(room, () => {
            console.log(`user ${username} joined the room`)
            userRoom = room
            // add user for certain room
            ChatRedis.addUser(room, socket.id, {
                username,
                status,
                privateChat: false
            })

            ChatRedis.getUsers(room).then(users => {
                if(users === null) return
                // notify all users in same room
                namespace.in(room).emit('newUser', {users, username})
                
            })
        })
    })
    socket.on('joinRoom', events.joinRoom(socket, namespace)) // join room
    socket.on('leaveRoom', events.leaveRoom(socket, namespace)) // leave room
    socket.on('publicMessage', events.publicMessage(namespace)) // listens for new public message
    socket.on('leaveChat', events.leaveChat(socket, namespace)) // leave chat
    socket.on('joinPrivateRoom', events.joinPrivateRoom(socket, namespace)) // join private room
    socket.on('leavePrivateRoom', events.leavePrivateRoom(socket, namespace)) // leave private room
    socket.on('privateMessage', events.privateMessage(namespace)) // private message
    socket.on('privateMessagePCSignaling', events.privateMessagePCSignaling(namespace))
    socket.on('changeStatus', events.changeStatus(socket, namespace)) // sets status

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnectd`)
        ChatRedis.getUser(userRoom, socket.id).then(user => {
            if(user !== null){
                events.leaveChat(socket, namespace)({
                    room: userRoom, 
                    username: user.username
                })
                return user
            }
        }).then(user => {
            ChatRedis.delUser(user.username, config.KEY)
        })
    })
}



exports.createNameSpace = (io) => {
    namespace = io
        .of(config.CHAT_NAMESPACE)
        .on('connection', onConnection)
}
