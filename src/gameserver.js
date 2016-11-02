var socketio = require('socket.io')
const Room = require('./room.js');

let rooms = {};
let roomCount = 0;
console.log("Starting the game server.")
createNewRoom(this.roomCount);

let io = {};

module.exports.listen = function(app){
  io = socketio.listen(app)
  
  module.exports.io = io;

  io.on("connection", (socket) => {
    console.log("Player joined.");
    joinRoom(socket);
    onDisconnect(socket);
  });

  return io;
}

function createNewRoom (id) {
  const room = new Room(Math.floor(Math.random()*1000), 8);
  rooms[room.name] = room;
  
  roomCount ++;
  
  return room;
}

function getOpenRoom () {
  for (let roomName in rooms) {
    let room = rooms[roomName];
    if (room.getNumberOpenSpots >= 1) {
      return room;
    }
  }
  return createNewRoom();
}

function joinRoom(ws) {
  const room = getOpenRoom();
  room.joinRoom(ws);
}

function leaveRoom(ws) {
  const room = ws.room;
  room.leaveRoom(ws);

  //  The room is now empty, delete it
  //  If its the last room dont delete
  if(room.getNumberPlayers == 0) {
    roomCount--;
    delete rooms[room.name];
  }
};
const onDisconnect = (sock) => {
  const socket = sock;
  
  socket.on('disconnect', (data) => {
    console.log("Player disconnected.");
    io.to(socket.room.getName).emit("user-disconnect", 'User left room.');
    leaveRoom(socket);
  });
};