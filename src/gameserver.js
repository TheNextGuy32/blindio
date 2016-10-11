const Room = require('room.js');

module.exports = class GameServer {

  constructor() {
    this.rooms = {};
    this.roomCount = 0;

    createNewRoom(this.roomCount);
  }

  get getOpenRoom () {
    for (let roomName in this.rooms) {
      let room = this.rooms[roomName];
      if (room.getOpenSpots() >= 1) {
        return room;
      }
    }
    return createNewRoom;
  }
  createNewRoom (id) {
    const room = new Room(id,8);
    this.rooms[room.name] = room;
    
    this.roomCount ++;
    
    return room;
  }
  joinRoom(ws) {
    const room = getOpenRoom();
    room.joinRoom(ws);
    ws.room = room;
  }
  leaveRoom(ws) {
    const room = ws.room;
    room.leaveRoom(ws);

    //  The room is now empty, delete it
    //  If its the last room dont delete
    if(room.numberPlayers() == 0) {
      this.roomCount--;
      delete this.rooms[room.name];
    }
  }
}
