"use strict";
var game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var player, yourKnife, otherPlayers, otherKnives, cursors, walls, knifeStatusText;
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
	
	knifeStatusText = game.add.text(0, 0, "Throwable Knife: true");
	
	
	//Todo in the future: Change arrow keys to WASD
	game.input.keyboard.addKeyCapture([Phaser.Keyboard.W]);
	game.input.keyboard.addKeyCapture([Phaser.Keyboard.A]);
	game.input.keyboard.addKeyCapture([Phaser.Keyboard.S]);
	game.input.keyboard.addKeyCapture([Phaser.Keyboard.D]);
	game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
	game.input.onDown.add(throwKnifeWithMouse, this);
}

function update() {
	game.physics.arcade.collide(player, walls);
	game.physics.arcade.collide(player, otherPlayers);
	if(yourKnife)
	{
		game.physics.arcade.overlap(yourKnife, walls, destroyFirstThing, null, this);
		game.physics.arcade.overlap(yourKnife, otherPlayers, destroyBothThings, null, this);
	}
	
	player.body.velocity.x = 0;
	player.body.velocity.y = 0;
	var moveSpeed = 300;
	
	if(game.input.keyboard.isDown(Phaser.Keyboard.A))
	{
		player.body.velocity.x -= moveSpeed;
	}
	if(game.input.keyboard.isDown(Phaser.Keyboard.D))
	{
		player.body.velocity.x += moveSpeed;
	}
	if(game.input.keyboard.isDown(Phaser.Keyboard.W))
	{
		player.body.velocity.y -= moveSpeed;
	}
	if(game.input.keyboard.isDown(Phaser.Keyboard.S))
	{
		player.body.velocity.y += moveSpeed;
	}
	
	//Enforces one-knife-at-once limit, re-enables throw as soon as existing knife dies. Todo: Add time delay like in unity game
	if(yourKnife && !yourKnife.alive)
	{
		yourKnife = null;
		knifeStatusText.text = "Throwable Knife: true";
	}
	
	knifeStatusText.position.x = game.camera.position.x+7;
	knifeStatusText.position.y = game.camera.position.y+10;
}

function throwKnife(posPoint, velPoint)
{
	yourKnife = game.add.sprite(posPoint.x, posPoint.y, 'wallSprite');
	game.physics.enable(yourKnife);
	yourKnife.checkWorldBounds = true;
	yourKnife.outOfBoundsKill = true;
	yourKnife.body.gravity.y = 0;
	yourKnife.scale.setTo(1/5, 1/5);
	
	yourKnife.body.center = posPoint;
	yourKnife.body.velocity = velPoint;
}

function throwKnifeWithMouse(pointer)
{
	if(yourKnife) //Safeguarding against null value of yourKnife
	{
		console.log("Error: Trying to throw a knife while one is already out");
		return;
	}
	
	var knifeVel = new Phaser.Point(pointer.position.x-(player.body.center.x-game.camera.position.x), pointer.position.y-(player.body.center.y-game.camera.position.y));
	knifeVel.setMagnitude(400);
	console.log(knifeVel+" - "+player.body.velocity);
	knifeVel.add(player.body.velocity.x, player.body.velocity.y);
	console.log(knifeVel);
	
	throwKnife(player.body.center, knifeVel);
	knifeStatusText.text = "Throwable Knife: false";
}

//These will have to be replaced with more specific functions later, but they work for prototyping.
function destroyFirstThing(firstThing, secondThing){firstThing.destroy();}
function destroySecondThing(firstThing, secondThing){secondThing.destroy();}
function destroyBothThings(firstThing, secondThing)
{
	destroyFirstThing(firstThing, secondThing);
	destroySecondThing(firstThing, secondThing);
}