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
    
    socket.on('join', (username) => {
      console.log("Player named " + username + " joined gameserver.");
      getOpenRoom().joinRoom(socket,username);
    });
    socket.on('disconnect', (data) => {
      console.log("Player left gameserver.");
    });
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

module.exports.closeRoom = function(room) {
  roomCount--;
  rooms[room.name];
}