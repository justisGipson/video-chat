const express = require('express')
const userRouter = express.Router()
const ChatRedis = require('../redis')
const config = require('../config')

/**
 * config.KEY: we just want to store the logged users (username must be unique)
 * so we always use the same key to adapt it to Redis implementation
 */

 userRouter.post('/login', (req, res) => {
    const newUser = req.body
    if (!newUser.username) return res.send({ code: 400, message: 'Data required'})

    console.log(`Login user ${newUser.username}`)

    ChatRedis.getUser(newUser.username, config.KEY)
        .then(user => {
            if (user === null) {
                ChatRedis.addUser(newUser.username, config.KEY, newUser)
                console.log(`User ${newUser.username} logged`)
                return res.send({ code: 200, message: 'Login successful' })
            }
            console.log(`User ${newUser.username} already exists`)
            return res.send({ code: 400, message: 'Username already exists'})
        })
 })

 // logout

 userRouter.post('/logout', (req, res) => {
     const user = req.body

     console.log(`Logout user ${user.username}`)

     ChatRedis.delUser(user.username, config.KEY)
        .then(data => {
            if (data === null) {
                return res.send({ code: 400, message: 'User not found'})
            }
            return res.send({ code: 200, message: 'Log out successful'})
        })
 })

 module.exports = userRouter
