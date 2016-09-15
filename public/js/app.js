"use strict";
let game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update });
let localPlayer, displayHandler, otherPlayers, otherKnives, cursors, walls, knifeStatusText, fpsText, windGroup;
//Other players' knives might not need to be simulated if the wind is synced well enough. Other players still ought to be for hit detection purposes -- both movement and knife-stabbing. 

//Keybind abstraction, I guess. Just some javascript for its own sake, because I doubt we're ever going to want to rebind the keys.
let MOVEMENT =
Object.seal({
    LEFT: Phaser.Keyboard.A,
    RIGHT: Phaser.Keyboard.D,
    UP: Phaser.Keyboard.W,
    DOWN: Phaser.Keyboard.S,
});

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
	
	localPlayer = new Player();
	
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
	
	displayHandler = new HUD();
	
	//Todo in the future: Change arrow keys to WASD
	game.input.keyboard.addKeyCapture([MOVEMENT.UP, MOVEMENT.DOWN, MOVEMENT.LEFT, MOVEMENT.RIGHT]);
	game.input.onDown.add(localPlayer.throwKnife, localPlayer);
}

function update() {
	//Collision groups
	game.physics.arcade.collide(windGroup, walls);
	
	
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
	
	//Updating things (for now just the player)
	localPlayer.update();
	
	
	//HUD text (TODO: FIGURE OUT HOW TO PROPERLY ANCHOR TEXT TO CAMERA)
	displayHandler.update();
}

function throwKnife(posPoint, velPoint)
{
	localPlayer.knife = game.add.sprite(posPoint.x, posPoint.y, 'wallSprite');
	game.physics.enable(localPlayer.knife);
	localPlayer.knife.checkWorldBounds = true;
	localPlayer.knife.outOfBoundsKill = true;
	localPlayer.knife.body.gravity.y = 0;
	localPlayer.knife.scale.setTo(1/5, 1/5);
	
	localPlayer.knife.body.center = posPoint;
	localPlayer.knife.body.velocity = velPoint;
}

//Overlap functions
function knifeHitsWall(knife, wall)
{
	console.log("YOU KNIFED A WALL");
//	knife.destroy(); //This is dangerous when we're dealing with sprite-vs-group overlaps, so I'm using the bool the overlap test returns to destroy the knife in the player's update.
}

function knifeHitsPlayer(knife, player)
{
	console.log("YOU KNIFED A PLAYER");
//	knife.destroy(); //See knifeHitsWall.
	player.destroy();
}

function windHitsThing(wind, thing)
{
	//TODO: THIS
	//Wind changes velocity, thing is unaffected
	//Function should be used with players & knives, not walls.
}


//Function-objects below. Normally I'd put them into their own object, but I want to avoid bloating the number of js files for now. It sacrifices the readability of this one a bit, but Ctrl+F never stopped being a thing.
function Player()
{
	this.knife = null;
	this.moveSpeed = 300;
	this.knifeSpeed = 800;
	this.gameObject;
	
	this.init = function()
	{
		this.gameObject = game.add.sprite(game.world.width/2, game.world.height/2, 'playerSprite');
		game.physics.enable(this.gameObject);
		this.gameObject.body.gravity.y = 0;
		this.gameObject.body.collideWorldBounds = true;
		game.camera.follow(this.gameObject);
	}
	
	this.update = function()
	{
		//Collision
		game.physics.arcade.collide(this.gameObject, walls);
		game.physics.arcade.collide(this.gameObject, otherPlayers);
		game.physics.arcade.collide(this.gameObject, windGroup);
		
		//Knife maintenance
		if(this.knife != null)
		{
			if(this.knife.alive)
			{
				game.physics.arcade.collide(this.knife, windGroup); //Todo: Consider replacing with overlap function or playing with mass values.
				
				if(game.physics.arcade.overlap(this.knife, otherPlayers, knifeHitsPlayer) || game.physics.arcade.overlap(this.knife, walls))
				{
					this.knife.destroy();
					this.knife = null;
				}
			}
			else
			{
				this.knife = null;
			}
		}
		
		//Movement
		this.gameObject.body.velocity.x = 0;
		this.gameObject.body.velocity.y = 0;
		if(game.input.keyboard.isDown(MOVEMENT.LEFT))
		{
			this.gameObject.body.velocity.x -= this.moveSpeed;
		}
		if(game.input.keyboard.isDown(MOVEMENT.RIGHT))
		{
			this.gameObject.body.velocity.x += this.moveSpeed;
		}
		if(game.input.keyboard.isDown(MOVEMENT.UP))
		{
			this.gameObject.body.velocity.y -= this.moveSpeed;
		}
		if(game.input.keyboard.isDown(MOVEMENT.DOWN))
		{
			this.gameObject.body.velocity.y += this.moveSpeed;
		}
	}
	
	this.throwKnife = function(pointer)
	{
		if(this.knife) //Safeguarding against null value of knife
		{
			console.log("Error: Trying to throw a knife while one is already out");
			return;
		}
	
		let knifeVel = new Phaser.Point(pointer.position.x-(this.gameObject.body.center.x-game.camera.position.x), pointer.position.y-(this.gameObject.body.center.y-game.camera.position.y));
		knifeVel.setMagnitude(this.knifeSpeed);
	
		throwKnife(this.gameObject.body.center, knifeVel);
	}
	
	this.init();
}

function HUD()
{
	this.knifeStatusText;
	this.fpsText;
	
	this.init = function()
	{
		this.knifeStatusText = game.add.text(0, 0, "");
		this.fpsText = game.add.text(0, 0, "");
	}
	
	this.update = function()
	{
		this.knifeStatusText.position.x = game.camera.position.x+7;
		this.knifeStatusText.position.y = game.camera.position.y+10;
		this.knifeStatusText.text = "Throwable Knife: "+(localPlayer.knife == null);
	
		this.fpsText.position.x = game.camera.position.x+7;
		this.fpsText.position.y = game.camera.position.y+675;
		this.fpsText.text = game.time.fps+" FPS";
	}
	
	this.init();
}
