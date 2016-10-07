const phaser = require("phaser");
let game, players, knives, walls;

function preload() {

}

function create() {
  game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
  game.physics.startSystem(Phaser.Physics.ARCADE);

  const WORLD_WIDTH = 2000;
  const WORLD_HEIGHT = 2000;
  game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
  players = game.add.group();
  players.enableBody = true;

  walls = game.add.group();
  walls.enableBody = true;
}
function createPlayer() {
  //player = game.add.sprite(game.world.width/2, game.world.height/2, 'playerSprite');
  //game.physics.enable(player);
  //player.body.gravity.y = 0;
  //player.body.collideWorldBounds = true;
}

function update() {
  game.physics.arcade.collide(players, walls);
  game.physics.arcade.collide(players, players);
  game.physics.arcade.overlap(knives, walls, destroyFirstThing, null, this);
  game.physics.arcade.overlap(knives, players, destroyBothThings, null, this);
  
  //player.body.velocity.x = 0;
  //player.body.velocity.y = 0;
  var moveSpeed = 300;
  
  // if(cursors.left.isDown)
  // {
  //   player.body.velocity.x -= moveSpeed;
  // }
  // if(cursors.right.isDown)
  // {
  //   player.body.velocity.x += moveSpeed;
  // }
  // if(cursors.up.isDown)
  // {
  //   player.body.velocity.y -= moveSpeed;
  // }
  // if(cursors.down.isDown)
  // {
  //   player.body.velocity.y += moveSpeed;
  // }
}

function spawnKnife(posX, posY, velX, velY)
{
  var knife = game.add.sprite(posX, posY, 'wallSprite');
  game.physics.enable(yourKnife);
  yourKnife.checkWorldBounds = true;
  yourKnife.outOfBoundsKill = true;
  yourKnife.body.gravity.y = 0;
  yourKnife.scale.setTo(1/5, 1/5);
  
  yourKnife.body.velocity.x = velX;
  yourKnife.body.velocity.y = velY;
  
  //todo: destroy knife(/knives) when they hit level bounds because HOLY SHIT IS THAT A HUGE MEMORY LEAK
  //also todo: only let player have one knife at once
}

//These will have to be replaced with more specific functions later, but they work for prototyping.
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