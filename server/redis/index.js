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
