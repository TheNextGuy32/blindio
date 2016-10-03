// const game = require('./gameserver.js');

// const users = {};

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', (data) => {
    console.log(data);

    //  Add the player
    socket.name = data.name;
    // users[socket.name] = socket;
    // socket.join('room');

    //  Log the event
    console.log(`${socket.name} joined the room.`);

    //  Respond with player id
    // socket.broadcast.to('room').emit('playerId', { id: 'wow' });
  });
};

const onMessage = (sock) => {
  const socket = sock;

  socket.on('input', (data) => {
    console.log(data);

    //  The player sent us their input data
    // game.processInput(socket.name, data);
  });

  //  The player can send no other data
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', (data) => {
    console.log(data);

    //  Remove the player
    // socket.leave('room');
    // delete users[socket.name];

    //  Log the event
    console.log(`${socket.name} left the room.`);

    //  We do not need to respond as the socket diconnected
  });
};

io.on('connection', (socket) => {
  onJoined(socket);
  onMessage(socket);
  onDisconnect(socket);
});
