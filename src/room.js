const p2 = require('p2');

let world;
let playersBodies = [];
let knifeBodies = [];
let wallBodies = [];

const windSpeed = 0;
const windPhase = 0;
const windDirection = 0;
const breezeForce = 3;
const breezeRotationSpeed = 0.00001;
const breezeBackAndForthSpeed = 0.0001;

const 
  PLAYER = Math.pow(2,0),
  KNIFE =  Math.pow(2,1),
  WALL = Math.pow(2,2);

module.exports = class Room {
  constructor(roomName, maxPlayers) {
    this.name = roomName;
    this.maxPlayers = maxPlayers != null ? maxPlayers : 8;
    this.connectedPlayers = [];
  }

  get name () {
    return this.name;
  }
  
  get numberPlayers () {
    return this.connectedPlayers.length();
  }
  get maxPlayers () {
    return this.maxPlayers;
  }
  get numberOpenSpots () {
    return this.maxPlayers - connectedPlayers.length();
  }

  joinRoom(ws) {
    ws.join(this.name);
    ws.emit('new player data',{});
    io.to(this.name).emit('ay new player');
  }
  leaveRoom(ws) {
    
    //  kill playerobject
    
    ws.leave(this.name);
  }
}

function create() {
  world = new p2.World();
 
  var timeStep = 1 / 60;
   
  setInterval(update, 1000 * timeStep);
}

function createWall(pos) {
  var wallBody = new p2.Body({
      position: pos
  });
  wallBody.collisionGroup = WALL;
  wallBody.collisionMask = PLAYER | KNIFE;
  wallBody.addShape(new p2.Box({ width: 1, height: 1}));
  wallBodies.add(wallBody);
  world.addBody(wallBody);
}
function createPlayer(pos) {
  var playerBody = new p2.Body({
      position: pos
  });
  playerBody.collisionGroup = PLAYER;
  playerBody.collisionMask = WALL | KNIFE;
  playerBody.addShape(new p2.Circle({ radius: 1 }));
  playerBodies.add(playerBody);
  world.addBody(playerBody);
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
  knifeBodies.add(knifeBody);
  world.addBody(knifeBody);
}

function warp(body) {
  let p = body.position;
  if(p[0] >  WIDTH /2) p[0] = -WIDTH/2;
  if(p[1] >  HEIGHT/2) p[1] = -HEIGHT/2;
  if(p[0] < -WIDTH /2) p[0] =  WIDTH/2;
  if(p[1] < -HEIGHT/2) p[1] =  HEIGHT/2;
}

function updatePhysics() {
  playerBodies.forEach(warp);
  knifeBodies.forEach(warp);
  wallBodies.forEach(warp);

  world.on("impact", (evt) => {
    let bodyA = evt.bodyA;
    let bodyB = evt.bodyB;

    if (bodyA.shapes[0].collisionGroup == KNIFE || bodyB.shapes[0].collisionGroup == KNIFE){
      // Knife collided with something
      let bulletBody = bodyA.shapes[0].collisionGroup == BULLET ? bodyA : bodyB,
          otherBody = bodyB == bulletBody ? bodyA : bodyB;

      if(otherBody.shapes[0].collisionGroup == WALL){
        //  Knife hitting wall
        console.log("Knife hit wall");
      } else {
        //  Knife hitting person
        console.log("Knife hit player");
      }
    } else {
      //  This collision is between player and wall
      console.log("Player collided with wall")
    }
  }
}
function update() {
  world.step(timeStep);
  updatePhysics();
  render();  
}