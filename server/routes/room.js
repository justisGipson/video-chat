const express = require('express')
const roomRouter = express.Router()

const rooms = [
    {
        id: 1,
        name: 'General'
    },
    {
        id: 2,
        name: 'Random'
    },
    {
        id: 3,
        name: 'Other'
    }
]

roomRouter.get('/', (req, res) => {
    res.send(rooms)
})

module.exports = roomRouter
