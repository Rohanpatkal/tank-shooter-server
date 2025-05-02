// File: /server/index.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*'
  }
});

const PORT = 4000;
let players = {};

io.on('connection', socket => {
  console.log('Player connected:', socket.id);

  players[socket.id] = {
    id: socket.id,
    x: Math.random() * 500,
    y: Math.random() * 500,
    angle: 0,
    bullets: []
  };

  socket.emit('init', players);
  socket.broadcast.emit('new-player', players[socket.id]);

  socket.on('move', data => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      players[socket.id].angle = data.angle;
    }
    io.emit('players-update', players);
  });

  socket.on('shoot', bullet => {
    if (players[socket.id]) {
      players[socket.id].bullets.push(bullet);
    }
    io.emit('players-update', players);
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('player-disconnect', socket.id);
    console.log('Player disconnected:', socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));