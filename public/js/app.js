"use strict";
let game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update });
let player, yourKnife, otherPlayers, otherKnives, cursors, walls, knifeStatusText, fpsText, windGroup;
//Other players' knives might not need to be simulated if the wind is synced well enough. Other players still ought to be for hit detection purposes -- both movement and knife-stabbing. 

//TODO (consider) moving breeze stuff into its own class. Maybe do the same for player stuff too.
let windSpeed = 0;
let windPhase = 0;
let windDirection = 0;
let breezeForce = 1;
let breezeRotationSpeed = 1;
let breezeBackAndForthSpeed = 1;

function preload() {
    game.load.image('skyBackground', 'assets/sky.png');
    game.load.image('playerSprite', 'assets/player.png');
    game.load.image('wallSprite', 'assets/wall.png');
}

function create() {
    game.time.advancedTiming = true;
    game.physics.startSystem(Phaser.Physics.ARCADE);

	//Adding things to world
	//Stuff is rendered in the order it's added (back to front)
	//Desired order: Background < Wind (to be added later) < Players < Walls
	
	let WORLD_WIDTH = 2000;
	let WORLD_HEIGHT = 2000;
    game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'skyBackground');
	game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
	
	let WIND_INTERVAL = 50;
	windGroup = game.add.group();
	windGroup.enableBody = true;
	for(let x = WIND_INTERVAL/2; x < WORLD_WIDTH; x += WIND_INTERVAL)
	{
		for(let y = WIND_INTERVAL/2; y < WORLD_HEIGHT; y += WIND_INTERVAL)
		{
			let newWind = windGroup.create(x, y, 'playerSprite');
			newWind.scale.setTo(1/5, 1/5);
			//newWind.body.velocity.y = -5000;
		}
	}
	
	player = game.add.sprite(game.world.width/2, game.world.height/2, 'playerSprite');
	game.physics.enable(player);
	player.body.gravity.y = 0;
	player.body.collideWorldBounds = true;
	game.camera.follow(player);
	
	otherPlayers = game.add.group();
	otherPlayers.enableBody = true;
	let newPlayer = otherPlayers.create(3*game.world.width/4, game.world.height/3, 'playerSprite');


	walls = game.add.group();
	walls.enableBody = true;
	
	//Wallsprite is 50px*50px, scale is multiplicative
	let newWall = walls.create(game.world.width/4-25, game.world.height/4-25, 'wallSprite');
	newWall.scale.setTo(2, 1);
	newWall.body.immovable = true;
	
	newWall = walls.create(1000, 1100, 'wallSprite');
	newWall.scale.setTo(5, 5);
	newWall.body.immovable = true;
	
	knifeStatusText = game.add.text(0, 0, "Throwable Knife: true");
	fpsText = game.add.text(0, 0, "");
	
	
	//Todo in the future: Change arrow keys to WASD
	game.input.keyboard.addKeyCapture([Phaser.Keyboard.W]);
	game.input.keyboard.addKeyCapture([Phaser.Keyboard.A]);
	game.input.keyboard.addKeyCapture([Phaser.Keyboard.S]);
	game.input.keyboard.addKeyCapture([Phaser.Keyboard.D]);
	game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
	game.input.onDown.add(throwKnifeWithMouse, this);
}

function update() {
	//Collision groups
	game.physics.arcade.collide(player, walls);
	game.physics.arcade.collide(player, otherPlayers);
	game.physics.arcade.collide(player, windGroup);
	game.physics.arcade.collide(windGroup, walls);
	if(yourKnife != null)
	{
		if(yourKnife.alive)
		{
			game.physics.arcade.collide(yourKnife, windGroup);
			game.physics.arcade.overlap(yourKnife, walls, knifeHitsWall, null, this);
			game.physics.arcade.overlap(yourKnife, otherPlayers, knifeHitsPlayer, null, this);
		}
		else
		{
			yourKnife = null;
			knifeStatusText.text = "Throwable Knife: true";
		}
	}
	
	
	//Wind acceleration & world wrap
	windDirection = breezeRotationSpeed * game.time.time;
	//sound stuff here MAYBE
	windPhase = breezeBackAndForthSpeed * game.time.time;
	let deltaVelX = Math.cos(windDirection) * Math.sin(windPhase) * breezeForce;
	let deltaVelY = Math.sin(windDirection) * Math.sin(windPhase) * breezeForce;
	windGroup.forEach(function(particle)
	{
		particle.body.velocity.x += deltaVelX;
		particle.body.velocity.y += deltaVelY;
		
		game.world.wrap(particle);
	}, this, true, null);
	
	//Player movement
	player.body.velocity.x = 0;
	player.body.velocity.y = 0;
	let playerMoveSpeed = 300;
	if(game.input.keyboard.isDown(Phaser.Keyboard.A))
	{
		player.body.velocity.x -= playerMoveSpeed;
	}
	if(game.input.keyboard.isDown(Phaser.Keyboard.D))
	{
		player.body.velocity.x += playerMoveSpeed;
	}
	if(game.input.keyboard.isDown(Phaser.Keyboard.W))
	{
		player.body.velocity.y -= playerMoveSpeed;
	}
	if(game.input.keyboard.isDown(Phaser.Keyboard.S))
	{
		player.body.velocity.y += playerMoveSpeed;
	}
	
	//HUD text (TODO: FIGURE OUT HOW TO PROPERLY ANCHOR TEXT TO CAMERA)
	knifeStatusText.position.x = game.camera.position.x+7;
	knifeStatusText.position.y = game.camera.position.y+10;
	
	fpsText.position.x = game.camera.position.x+7;
	fpsText.position.y = game.camera.position.y+675;
	fpsText.text = game.time.fps+" FPS";
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
	
	let knifeVel = new Phaser.Point(pointer.position.x-(player.body.center.x-game.camera.position.x), pointer.position.y-(player.body.center.y-game.camera.position.y));
	knifeVel.setMagnitude(400);
	
	throwKnife(player.body.center, knifeVel);
	knifeStatusText.text = "Throwable Knife: false";
}

//Overlap functions
function knifeHitsWall(knife, wall)
{
	knife.destroy();
}

function knifeHitsPlayer(knife, player)
{
	knife.destroy();
	player.destroy();
}

function windHitsThing(wind, thing)
{
	//TODO: THIS
	//Wind changes velocity, thing is unaffected
	//Function should be used with players & knives, not walls.
}