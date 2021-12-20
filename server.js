const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  // console.log(socket.id);
  socket.on('join-room', (roomId, userId) => {
    // console.log('user: ' + userId +' just joined room: ' + roomId);
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId)

    socket.on('disconnect', () => {
      // socket.to(roomId).broadcast.emit('user-disconnected', userId)
      socket.to(roomId).emit('user-disconnected', userId)
    })
  })
})

server.listen()