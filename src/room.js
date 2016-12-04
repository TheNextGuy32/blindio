const p2 = require('p2');
const gameserver = require('./gameserver.js');

let world;
let playerObjects = [];
let knifeObjects = [];

let clientWalls = [];

const windSpeed = 0;
let windPhase = 0;
let windDirection = 0;
const breezeForce = 3;
const breezeRotationSpeed = 10;
const breezeBackAndForthSpeed = 10;

const TIME_STEP = 1 / 60;

const WIDTH  = 2000,
      HEIGHT = 2000;
      
const 
  PLAYER = Math.pow(2,0),
  KNIFE =  Math.pow(2,1),
  WALL = Math.pow(2,2);

const moveSpeed = 300;

function isEmpty(map) {
   var empty = true;

   for(var key in map) {
      empty = false;
      break;
   }

   return empty;
}

module.exports = class Room {
  constructor(roomName, maxPlayerCount) {
    
    this.name = roomName;
    this.maxPlayers = maxPlayerCount ? maxPlayerCount : 8;
    
    console.log(`Created room named ${this.name} of size ${this.maxPlayers}.`);

    this.connectedPlayers = [];
    world = new p2.World();
    
    //clientWalls.push(createWall([0,0]));

    setInterval(()=>{this.update()}, 1000 * TIME_STEP);
  }

  get getName () {
    return this.name;
  }
  set setName (newName) {
    if(newName) {
      this.name = newName;
    }
  }
  
  get getNumberPlayers () {
    return this.connectedPlayers.length;
  }

  get getMaxPlayers () {
    return this.maxPlayers;
  }

  set setMaxPlayers (count) {
    if(count) {
      this.maxPlayers = count;
    }
  }

  get getNumberOpenSpots () {
    return this.getMaxPlayers - this.getNumberPlayers;
  }
  updatePhysics(TIME_STEP) {

    for(let p = 0 ; p < playerObjects.length ; p++)
    {
      let playerBody = world.getBodyById(playerObjects[p].ws.client.id);
      
      if(!playerBody) {
        //  disconnect this player
        continue;
      }

      if(!playerObjects[p].input || isEmpty(playerObjects[p].input)) {
        //  No input means not moving
        playerBody.velocity[0] = 0;
        playerBody.velocity[1] = 0;
        continue;
      }

      playerBody.velocity[0] = (playerObjects[p].input.right - playerObjects[p].input.left) * moveSpeed;
      playerBody.velocity[1] = (playerObjects[p].input.down - playerObjects[p].input.up) * moveSpeed;

    }
    // playerBodies.forEach(warp);
    // knifeBodies.forEach(warp);
    // wallBodies.forEach(warp);

    // world.on("impact", (evt) => {
    //   let bodyA = evt.bodyA;
    //   let bodyB = evt.bodyB;

    //   if (bodyA.shapes[0].collisionGroup == KNIFE || bodyB.shapes[0].collisionGroup == KNIFE){
    //     // Knife collided with something
    //     let bulletBody = bodyA.shapes[0].collisionGroup == BULLET ? bodyA : bodyB,
    //         otherBody = bodyB == bulletBody ? bodyA : bodyB;

    //     if(otherBody.shapes[0].collisionGroup == WALL){
    //       //  Knife hitting wall
    //       console.log("Knife hit wall");
    //     } else {
    //       //  Knife hitting person
    //       console.log("Knife hit player");
    //     }
    //   } else {
    //     //  This collision is between player and wall
    //     console.log("Player collided with wall");
    //   }
    // });
  }
  wind(TIME_STEP) {
    windDirection = (breezeRotationSpeed * TIME_STEP) % (2*Math.PI);
    windPhase = (breezeBackAndForthSpeed * TIME_STEP) % (2*Math.PI);

    gameserver.io.in(this.name).emit('wind', {phase: windPhase, direction: windDirection });
  }
  positions(TIME_STEP) {
    //  Sending player positions
    let objectStates = {
      players: [],
    };
    for(let p = 0 ; p < playerObjects.length ; p++) {
      
      const id = playerObjects[p].ws.client.id;
      let body = world.getBodyById(id);

      //console.dir(body.position);

      objectStates.players.push({
        id: id,
        position: body.position,
        velocity: body.velocity,
        cooldown: 0,
      });
    }

    gameserver.io.in(this.name).emit('object-states', objectStates);
  }
  update() {
    world.step(TIME_STEP);
    
    this.updatePhysics(TIME_STEP);
    this.positions(TIME_STEP);
    this.wind(TIME_STEP);
  }
  
  joinRoom(socket,username) {

    socket.join(this.name);
    socket.room = this;

    //  All information necessary to bring new player up to speed
    var playerInfo = [];

    for(var p = 0 ; p < playerObjects.length ; p++) {
      playerInfo.push({
        username: playerObjects[p].username,
        id: playerObjects[p].ws.id,
      });
    }

    socket.emit('load-level', {
      roomName: this.name, 
      walls: clientWalls,
      players: playerInfo
    });

    socket.on("input", (data) => {
      for(let i = 0 ; i < playerObjects.length; i++) {
        if (data.id === playerObjects[i].ws.client.id) {
          playerObjects[i].input = data;        
        }
      }
    });

    //  Create the player
    let player = {
      username: username,
      ws: socket,
      input: {},
    };
    var newPlayerPosition = [0,0];
    createPlayerBody(player.ws.client.id, newPlayerPosition);
    playerObjects.push(player);

    //  Broadcast player info for adding to clients
    socket.broadcast.to(socket.room.getName).emit("user-connect", {
      id: socket.id,
      position: newPlayerPosition,
      username: username
    });
    
    socket.on('disconnect', (data) => {
      console.log("Player left room.");
      socket.broadcast.to(socket.room.getName).emit("user-disconnect", {
        id: socket.id,
        username: username
      });
      leaveRoom(socket);
    });
  }

  leaveRoom(ws) {
    
    for(let p = 0 ; p < playerObjects.length ; p ++) {
      if(playerObjects[p].ws === ws)
      {
        playerObjects.splice(p,1);
      }
    }
    
    ws.leave(this.name);
  }
}

function createWall(pos) {
  var wallBody = new p2.Body({
      mass: 1,
      position: pos,
      velocity: [0, 0],
  });
  wallBody.collisionGroup = WALL;
  wallBody.collisionMask = PLAYER | KNIFE;
  wallBody.addShape(new p2.Box({ width: 1, height: 1}));
  world.addBody(wallBody);

  return {
    pos: pos,
    width: 1,
    height: 1, 
  };
}
function createPlayerBody(id, pos) {
  var playerBody = new p2.Body({
      position: pos,
      id: id
  });
  playerBody.collisionGroup = PLAYER;
  playerBody.collisionMask = WALL | KNIFE;
  playerBody.addShape(new p2.Circle({ radius: 1 }));
  world.addBody(playerBody);
  return playerBody;
}

function createKnife(pos, vel) {
  let knifeBody = new p2.Body({
    mass: 5,
    position: pos,
    velocity: vel
  });
  knifeBody.collisionGroup = KNIFE;
  knifeBody.collisionMask = WALL | PLAYER;
  knifeBody.addShape(new p2.Circle({ radius: 1 }));
  //knifeBodies.push(knifeBody);
  world.addBody(knifeBody);
  return knifeBody;
}

function warp(body) {
  let p = body.position;
  if(p[0] >  WIDTH /2) p[0] = -WIDTH/2;
  if(p[1] >  HEIGHT/2) p[1] = -HEIGHT/2;
  if(p[0] < -WIDTH /2) p[0] =  WIDTH/2;
  if(p[1] < -HEIGHT/2) p[1] =  HEIGHT/2;
}


function leaveRoom(ws) {
  const room = ws.room;
  room.leaveRoom(ws);

  //  The room is now empty, delete it
  //  If its the last room dont delete
  if(room.getNumberPlayers == 0) {
    gameserver.closeRoom(room);
  }
};
