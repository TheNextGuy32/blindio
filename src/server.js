const express = require('express');
const path = require('path');
// const enrouten = require('express-enrouten');

const Player = require('player.js');
const GameServer = require('gameserver.js')

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static(path.resolve(`${__dirname}/../public`)));
app.get('/', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../public/index.html`));
});

const gameserver = new GameServer();

// app.use(enrouten({ directory: 'routes' }));

server.listen(Number(process.env.PORT || 5000));
console.log(`Listening on port ${process.env.PORT || 5000}`);

io.on("connection", (socket) => {
  onJoined(socket);
  onMessage(socket);
  onDisconnect(socket);
});

const onJoined = (sock) => {
  const socket = sock;
  
  socket.on('join', (data) => {
    socket.name = data.name;
    gameserver.joinRoom(socket)
  })
};

const onMessage = (sock) => {
  const socket = sock;

  socket.on('msgToServer', (data) => {
    //console.log("Sent from client " + data.msg);
    //gameserver.passMessage(socket, data.msg);
  });
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', (data) => {
    gameserver.leaveRoom(socket);
  });
};
