const redis = require('redis')
const bluebird = require('bluebird')

const config = require('../config')

bluebird.promisifyAll(redis)

function ChatRedis() {
    this.client = redis.createClient({
        host: config.REDIS_HOST
    })
}

/**
 * Add user with hash
 * @param {} room
 * @param {} socketId
 * @param {} userObject
 */
ChatRedis.prototype.addUser = (room, socketId, userObject) => {
    this.client.hsetAsync(room, socketId, JSON.stringify(userObject)).then(
        () => console.log('addUser', userObject.username + 'aaded to the room ' + room),
        err => console.log(err)
    )
}

/**
 * get all users by room
 *  @param {} room
 */
ChatRedis.prototype.getUsers = (room) => {
    return this.client.hgetallAsync(room).then(users => {
        const userList = []
        for (let user in users) {
            userList.push(JSON.parse(users[user]))
        }
        return userList
    }, err => {
        console.log('getUsers', err)
        return null
    })
}

/**
 * delete a user in room w/ socketId
 * @param {} room
 * @param {} socketId
 */
ChatRedis.prototype.delUser = (room, socketId) => {
    return this.client.hdelAsync(room, socketId).then(
        res => (res),
        err => {
            console.log('delUser', err)
            return null
        }
    )
}

/**
 * get user by room and socketId
 * @param {} room
 * @param {} socketId
 */
ChatRedis.prototype.getUser = (room, socketId) => {
    return this.client.hgetAsync(room, socketId).then(
        res => JSON.parse(res),
        err => {
            console.log('getUser', err)
            return null
        }
    )
}

/**
 * set user
 * @param {} room
 * @param {} socketId
 * @param {} newValue
 */
ChatRedis.prototype.setUser = (room, socketId, newValue) => {
    return this.client.hsetAsync(room, socketId, JSON.stringify(newValue)).then(
        res => res,
        err => {
            console.log('setUser', err)
            return null
        }
    )
}

module.exports = new ChatRedis()
