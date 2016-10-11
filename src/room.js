const phaser = require('phaser');

let game, players, knives, walls;

const windSpeed = 0;
const windPhase = 0;
const windDirection = 0;
const breezeForce = 3;
const breezeRotationSpeed = 0.00001;
const breezeBackAndForthSpeed = 0.0001;

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
  game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload, create, update });

  game.time.advancedTiming = true;
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.world.setBounds(0, 0, 2000, 2000);

  players = game.add.group();
  players.enableBody = true;

  walls = game.add.group();
  walls.enableBody = true;
}

function preload() {

}

function createPlayer() {
  // player = game.add.sprite(game.world.width/2, game.world.height/2, 'playerSprite');
  // game.physics.enable(player);
  // player.body.gravity.y = 0;
  // player.body.collideWorldBounds = true;
}

function update() {
  game.physics.arcade.collide(players, walls);
  game.physics.arcade.collide(players, players);
  game.physics.arcade.overlap(knives, walls, destroyFirstThing, null, this);
  game.physics.arcade.overlap(knives, players, destroyBothThings, null, this);

  // player.body.velocity.x = 0;
  // player.body.velocity.y = 0;
  
}

function spawnKnife(posX, posY, velX, velY)
{
  const knife = game.add.sprite(posX, posY, 'wallSprite');
  game.physics.enable(yourKnife);
  yourKnife.checkWorldBounds = true;
  yourKnife.outOfBoundsKill = true;
  yourKnife.body.gravity.y = 0;
  yourKnife.scale.setTo(1 / 5, 1 / 5);

  yourKnife.body.velocity.x = velX;
  yourKnife.body.velocity.y = velY;

  // todo: destroy knife(/knives) when they hit level bounds because HOLY SHIT IS THAT A HUGE MEMORY LEAK
  // also todo: only let player have one knife at once
}

// These will have to be replaced with more specific functions later, but they work for prototyping.
function destroyFirstThing(firstThing, secondThing)
{
  firstThing.destroy();
  firstThing = null;
}
function destroySecondThing(firstThing, secondThing)
{
  secondThing.destroy();
}
function destroyBothThings(firstThing, secondThing)
{
  destroyFirstThing(firstThing, secondThing);
  destroySecondThing(firstThing, secondThing);
}
