"use strict";
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var player, yourKnife, otherPlayers, otherKnives, cursors, walls;
//Other players' knives might not need to be simulated if the wind is synced well enough. Other players still ought to be for hit detection purposes -- both movement and knife-stabbing. 

function preload() {
    game.load.image('skyBackground', 'assets/sky.png');
    game.load.image('playerSprite', 'assets/player.png');
    game.load.image('wallSprite', 'assets/wall.png');
}

function create() {
    
    game.physics.startSystem(Phaser.Physics.ARCADE);

	//Adding things to world
	//Stuff is rendered in the order it's added (back to front)
	//Desired order: Background < Wind (to be added later) < Players < Walls
	
	var WORLD_WIDTH = 2000;
	var WORLD_HEIGHT = 2000;
    game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'skyBackground');
	game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
	
	player = game.add.sprite(game.world.width/2, game.world.height/2, 'playerSprite');
	game.physics.enable(player);
	player.body.gravity.y = 0;
	player.body.collideWorldBounds = true;
	game.camera.follow(player);
	
	otherPlayers = game.add.group();
	otherPlayers.enableBody = true;
	var newPlayer = otherPlayers.create(3*game.world.width/4, game.world.height/3, 'playerSprite');


	walls = game.add.group();
	walls.enableBody = true;
	
	//Wallsprite is 50px*50px, scale is multiplicative
	var newWall = walls.create(game.world.width/4-25, game.world.height/4-25, 'wallSprite');
	newWall.scale.setTo(2, 1);
	newWall.body.immovable = true;
	
	newWall = walls.create(1000, 1100, 'wallSprite');
	newWall.scale.setTo(5, 5);
	newWall.body.immovable = true;
	
	
	//Todo in the future: Change arrow keys to WASD
    cursors = game.input.keyboard.createCursorKeys();
	game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
}

function update() {
	game.physics.arcade.collide(player, walls);
	game.physics.arcade.collide(player, otherPlayers);
	game.physics.arcade.overlap(player, walls, destroySecondThing, null, this);
	game.physics.arcade.overlap(yourKnife, walls, destroyFirstThing, null, this);
	game.physics.arcade.overlap(yourKnife, otherPlayers, destroyBothThings, null, this);
	
	player.body.velocity.x = 0;
	player.body.velocity.y = 0;
	var moveSpeed = 300;
	
	if(cursors.left.isDown)
	{
		player.body.velocity.x -= moveSpeed;
	}
	if(cursors.right.isDown)
	{
		player.body.velocity.x += moveSpeed;
	}
	if(cursors.up.isDown)
	{
		player.body.velocity.y -= moveSpeed;
	}
	if(cursors.down.isDown)
	{
		player.body.velocity.y += moveSpeed;
	}
	
	//Enforces one-knife-at-once limit, re-enables throw as soon as existing knife dies. Todo: Add time delay like in unity game
	if(yourKnife == null)
	{
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
		{
			//Todo: Trigger this on mouse click, use position to determine knife velocity
			throwKnife(player.position.x+20, player.position.y+20, 400, 0);
		}
	}
	else
	{
		if(!yourKnife.alive)
		{
			yourKnife = null;
		}
	}
}

function throwKnife(posX, posY, velX, velY)
{
	yourKnife = game.add.sprite(posX, posY, 'wallSprite');
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
function destroyFirstThing(firstThing, secondThing){firstThing.destroy(); firstThing = null;}
function destroySecondThing(firstThing, secondThing){secondThing.destroy();}
function destroyBothThings(firstThing, secondThing)
{
	destroyFirstThing(firstThing, secondThing);
	destroySecondThing(firstThing, secondThing);
}