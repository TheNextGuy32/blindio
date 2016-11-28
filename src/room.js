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

module.exports = class Room {
  constructor(roomName, maxPlayerCount) {
    
    this.name = roomName;
    this.maxPlayers = maxPlayerCount ? maxPlayerCount : 8;
    
    console.log(`Created room named ${this.name} of size ${this.maxPlayers}.`);

    this.connectedPlayers = [];
    world = new p2.World();
    
    clientWalls.push(createWall([0,0]));

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
  updatePhysics() {
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
      knives: [],
    };
    for(let p = 0 ; p < playerObjects.length ; p++) {
      objectStates.players.push({
        id: playerObjects[p].id,
        body: playerObjects[p].body,
      });
    }

    for(let k = 0 ; k < knifeObjects.length ; k++) {
      objectStates.knifeObjects.push({
        id: knifeObjects[p].id,
        body: knifeObjects[p].body,
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
  
  joinRoom(socket) {
    socket.join(this.name);
    socket.room = this;

    socket.emit('load-level', {
      roomName: this.name, 
      walls: clientWalls,
    });
  
    socket.on('disconnect', (data) => {
      console.log("Player left room.");
      gameserver.io.to(socket.room.getName).emit("user-disconnect", 'User left room.');
      leaveRoom(socket);
    });

    socket.on('sending name', (data) => {
      console.log("This player is named " + data + ".");
    });

    socket.on("input", (data) => {
      console.dir(data.id);
      for(let i = 0 ; i < playerObjects.length; i++) {
        console.dir(playerObjects[i].ws);
      }
    });

    //  Create the player that hes using
    //  id
    let player = {
      ws: socket,
      id: Math.random()*10000,
      body: {},//createPlayerBody([0,0]),
      input: {},
    };
    playerObjects.push(player);

    //gameserver.io.in(this.name).emit('message', 'A new player entered the room.');
  }

  leaveRoom(ws) {
    
    for(let p = 0 ; p < playerObjects.length ; p ++) {
      if(playerObjects[p].ws === ws)
      {
        //  kill playerobject
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
function createPlayerBody(pos) {
  var playerBody = new p2.Body({
      position: pos
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
