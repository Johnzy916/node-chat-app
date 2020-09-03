const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const NodeGeocoder = require('node-geocoder')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const { capitalizeWords, capitalizeUserArray } = require('./utils/capitalize')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

// Bot name
const botName = 'ZippyBot'

// Reverse Geocoder
const geoOptions = { 
    provider: 'geocodio',
    apiKey: 'cf30d78cfffd88f2086cf253f8dff355c2c85c0'
}
const geocoder = NodeGeocoder(geoOptions)

app.use(express.static('public'))

// Socket.io
io.on('connection', (socket) => {
    console.log('New WebSocket connection!')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage(botName, 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(botName, `${capitalizeWords(user.username)} has joined!`))
        io.to(user.room).emit('roomData', {
            room: capitalizeWords(user.room),
            users: capitalizeUserArray(getUsersInRoom(user.room))
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(capitalizeWords(user.username), message))

        callback()
    })

    socket.on('sendLocation', async (lat, lon, callback) => {
        const user = getUser(socket.id)

        const location = await geocoder.reverse({ lat, lon })
        const { city, state } = location[0]
        const url = `https://google.com/maps?q=${city.replace(' ', '+')},+${state}`

        io.to(user.room).emit('locationMessage', generateLocationMessage(capitalizeWords(user.username), city, state, url))

        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(botName, `${capitalizeWords(user.username)} has left!`))
            io.to(user.room).emit('roomData', {
                room: capitalizeWords(user.room),
                users: capitalizeUserArray(getUsersInRoom(user.room))
            })
        }
    })
})

server.listen(port, () => console.log(`Server running on port ${port}!`))