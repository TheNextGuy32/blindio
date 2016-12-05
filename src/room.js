const p2 = require('p2');
const gameserver = require('./gameserver.js');

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
    this.maxPlayers = maxPlayerCount ? maxPlayerCount : 2;

    this.playerObjects = [];
    this.knifeObjects = [];

    this.clientWalls = [];

    this.connectedPlayers = 0;
    this.world = new p2.World();

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
    return this.connectedPlayers;
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

    for(let p = 0 ; p < this.playerObjects.length ; p++)
    {
      let playerBody = this.world.getBodyById(this.playerObjects[p].ws.client.id);
      
      if(!playerBody) {
        //  disconnect this player
        continue;
      }

      if(!this.playerObjects[p].input || isEmpty(this.playerObjects[p].input)) {
        //  No input means not moving
        playerBody.velocity[0] = 0;
        playerBody.velocity[1] = 0;
        continue;
      }

      playerBody.velocity[0] = (this.playerObjects[p].input.right - this.playerObjects[p].input.left) * moveSpeed;
      playerBody.velocity[1] = (this.playerObjects[p].input.down - this.playerObjects[p].input.up) * moveSpeed;

    }
    // playerBodies.forEach(this.warp);
    // knifeBodies.forEach(this.warp);
    // wallBodies.forEach(this.warp);

    // this.world.on("impact", (evt) => {
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
    for(let p = 0 ; p < this.playerObjects.length ; p++) {
      
      const id = this.playerObjects[p].ws.client.id;
      let body = this.world.getBodyById(id);

      if(!body) { 
        continue;
      }

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
    this.world.step(TIME_STEP);
    
    this.updatePhysics(TIME_STEP);
    this.positions(TIME_STEP);
    this.wind(TIME_STEP);
  }
  
  joinRoom(socket,username) {

    socket.join(this.name);
    socket.room = this;

    //  All information necessary to bring new player up to speed
    var playerInfo = [];

    for(var p = 0 ; p < this.playerObjects.length ; p++) {
      playerInfo.push({
        username: this.playerObjects[p].username,
        id: this.playerObjects[p].ws.id,
      });
    }

    socket.emit('load-level', {
      roomName: this.name, 
      walls: this.clientWalls,
      players: playerInfo
    });

    socket.on("input", (data) => {
      for(let i = 0 ; i < this.playerObjects.length; i++) {
        if (data.id === this.playerObjects[i].ws.client.id) {
          this.playerObjects[i].input = data;        
        }
      }
    });

    //  Create the player
    let player = {
      username: username,
      ws: socket,
      input: {},
    };
    var newPlayerPosition = [Math.random()*WIDTH,Math.random()*HEIGHT];
    this.createPlayerBody(player.ws.client.id, newPlayerPosition);
    this.playerObjects.push(player);
    this.connectedPlayers ++;

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
      this.leaveRoom(socket);
    });
  }

  leaveRoom(ws) {
    
    for(let p = 0 ; p < this.playerObjects.length ; p ++) {
      if(this.playerObjects[p].ws === ws)
      {
        this.playerObjects.splice(p,1);
        this.connectedPlayers --;

        if(this.connectedPlayers == 0) {
          gameserver.closeRoom(this);
        }
      }
    }
    
    ws.leave(this.name);
  }
  createWall(pos) {
    var wallBody = new p2.Body({
        mass: 1,
        position: pos,
        velocity: [0, 0],
    });
    wallBody.collisionGroup = WALL;
    wallBody.collisionMask = PLAYER | KNIFE;
    wallBody.addShape(new p2.Box({ width: 1, height: 1}));
    this.world.addBody(wallBody);
  }
  createPlayerBody(id, pos) {
    var playerBody = new p2.Body({
        position: pos,
        id: id
    });
    playerBody.collisionGroup = PLAYER;
    playerBody.collisionMask = WALL | KNIFE;
    playerBody.addShape(new p2.Circle({ radius: 1 }));
    this.world.addBody(playerBody);
  }

  createKnife(pos, vel) {
    let knifeBody = new p2.Body({
      mass: 5,
      position: pos,
      velocity: vel
    });
    knifeBody.collisionGroup = KNIFE;
    knifeBody.collisionMask = WALL | PLAYER;
    knifeBody.addShape(new p2.Circle({ radius: 1 }));
    this.world.addBody(knifeBody);
  }

  warp(body) {
    let p = body.position;
    if(p[0] >  WIDTH /2) p[0] = -WIDTH/2;
    if(p[1] >  HEIGHT/2) p[1] = -HEIGHT/2;
    if(p[0] < -WIDTH /2) p[0] =  WIDTH/2;
    if(p[1] < -HEIGHT/2) p[1] =  HEIGHT/2;
  }
}