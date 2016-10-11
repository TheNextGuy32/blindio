"use strict";

let game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update });
let displayHandler, players, walls, windGroup;
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
const breezeForce = 3;
const breezeRotationSpeed = 0.00001;
const breezeBackAndForthSpeed = 0.0001;

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
	
/*
	let WIND_INTERVAL = 50;
	windGroup = game.add.group();
	windGroup.enableBody = true;
	for(let x = WIND_INTERVAL/2; x < WORLD_WIDTH; x += WIND_INTERVAL)
	{
		for(let y = WIND_INTERVAL/2; y < WORLD_HEIGHT; y += WIND_INTERVAL)
		{
			let newWind = windGroup.create(x, y, 'playerSprite');
			newWind.scale.setTo(1/5, 1/5);
			newWind.body.mass = 0.5;
			//newWind.body.velocity.y = -5000;
		}
	}
*/
	
	players = [];
	players.push(new LocalPlayer(game.world.width/2, game.world.height/2, "Local Player"));
	game.camera.follow(players[0].gameObject);
	
	//Adding NPCs -- dummy characters for now, networked players later.
	players.push(new GameCharacter(3*game.world.width/4, game.world.height/3, "CPU Player #1"));
	players.push(new GameCharacter(game.world.width/4, 2*game.world.height/3, "CPU Player #2"));


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
}

function update() {
/*
	//Collision groups
	game.physics.arcade.collide(windGroup, walls);
	
	//Wind acceleration & world wrap
	windDirection = (breezeRotationSpeed * game.time.time) % (2*Math.PI);//  What direction teh  wind is pointing
	windPhase = (breezeBackAndForthSpeed * game.time.time) % (2*Math.PI);//  The bakc and worth sway of wind

	let windSpeed = Math.sin(windPhase) * breezeForce;
	
	windGroup.forEach(
		function(particle) {
			particle.body.velocity.x += Math.cos(windDirection) * windSpeed;
			particle.body.velocity.y += Math.sin(windDirection) * windSpeed;
		
			game.world.wrap(particle);
		}, this, true, null);
*/

	//Updating things
	players.forEach(function(element, index, array){element.update();});
	
	//HUD text (TODO: FIGURE OUT HOW TO PROPERLY ANCHOR TEXT TO CAMERA)
	displayHandler.update();
}

function throwKnife(player, posPoint, velPoint)
{
	player.knife = game.add.sprite(posPoint.x, posPoint.y, 'wallSprite');
	game.physics.enable(player.knife);
	player.knife.checkWorldBounds = true;
	player.knife.outOfBoundsKill = true;
	player.knife.body.immovable = true;
	player.knife.scale.setTo(1/5, 1/5);
	
	player.knife.body.center = posPoint;
	player.knife.body.velocity = velPoint;
}

class GameCharacter
{
	/*
	Member variables:
		name
		knife
		gameObject
	*/
	
	constructor(x, y, name)
	{
		this.knife = null;
		this.gameObject = game.add.sprite(x, y, 'playerSprite');
		game.physics.enable(this.gameObject);
		this.gameObject.body.collideWorldBounds = true;
		this.name = name;
	}
	
	update()
	{
		game.physics.arcade.collide(this.gameObject, walls);
		for(let i = 0; i < players.length && players[i] != this; i++)
		{
			game.physics.arcade.collide(this.gameObject, players[i].gameObject);
		}
		
		if(this.knife != null)
		{
			if(this.knife.alive)
			{
				game.physics.arcade.collide(this.knife, windGroup); //Todo: Consider replacing with overlap function or playing with mass values.
				
				if(game.physics.arcade.overlap(this.knife, walls)) //Knife cutting functions are to be handled either serverside or clientside - these overlap tests are just for looks and might be changed later.
				{
					this.knife.destroy();
					this.knife = null;
				}
				else
				{
					for(let i = 0; i < players.length; i++)
					{
						if(players[i] != this && game.physics.arcade.overlap(this.knife, players[i].gameObject))
						{
							players[i].killCharacter();
							//TODO: Send "players[i].name killed by this.name" message, increment score, etc
							this.knife.destroy();
							this.knife = null;
							break;
						}
					}
				}
			}
			else
			{
				this.knife = null;
			}
		}
	}
	
	killCharacter()
	{
		this.gameObject.destroy();
		
		let timeBeforeRespawn = 3000; //measured in ms
		setTimeout(GameCharacter.respawnCharacter, timeBeforeRespawn, this);
		
		console.log(this.name+" IS DEAD");
	}
	
	static respawnCharacter(charToRespawn)
	{
		//TODO: This, but better
		let newPosX = Math.random()*game.world.width;
		let newPosY = Math.random()*game.world.height;
		
		charToRespawn.gameObject = game.add.sprite(newPosX, newPosY, 'playerSprite');
		game.physics.enable(charToRespawn.gameObject);
		charToRespawn.gameObject.body.collideWorldBounds = true;
		
		//Prevents spawning inside walls - does not work right now.
		/*while(game.physics.arcade.overlap(charToRespawn.gameObject, walls))
		{
			console.log("MOVING OUT OF A WALL");
			newPosX = Math.random()*game.world.width;
			newPosY = Math.random()*game.world.height;
			
			charToRespawn.gameObject.x = *game.world.width;
			charToRespawn.gameObject.y = Math.random()*game.world.height;
		}*/
		
		console.log(charToRespawn.name+" LIVES AGAIN AT ", charToRespawn.gameObject.body.position);
	}
	
	throwKnife(vel){throwKnife(this, this.gameObject.body.center, vel);}
	
	
	get Velocity(){return this.gameObject.body.velocity;}
	set Velocity(velPoint) //should be Phaser.Point
	{
		this.gameObject.body.velocity = velPoint;
	}
	get Position(){return this.gameObject.body.position;}
	set Position(posPoint) //should be Phaser.Point
	{
		this.gameObject.body.position = posPoint;
	}
	get Name(){return this.name;}
}

class LocalPlayer extends GameCharacter
{
	constructor(x, y, name)
	{
		super(x, y, name);
		game.input.onDown.add(this.throwKnifeAtPointer, this);
	}

	update()
	{
		super.update();
		
		let moveSpeed = 300;
		this.Velocity = new Phaser.Point((game.input.keyboard.isDown(MOVEMENT.RIGHT)-game.input.keyboard.isDown(MOVEMENT.LEFT))*moveSpeed,
						   (game.input.keyboard.isDown(MOVEMENT.DOWN)-game.input.keyboard.isDown(MOVEMENT.UP))*moveSpeed);
	}

	throwKnifeAtPointer(pointer)
	{
		if(this.knife) //Safeguarding against null value of knife
		{
			console.log("Error: Trying to throw a knife while one is already out");
			return;
		}

		let knifeVel = new Phaser.Point(pointer.position.x-(this.gameObject.body.center.x-game.camera.position.x), pointer.position.y-(this.gameObject.body.center.y-game.camera.position.y));
		knifeVel.setMagnitude(800);

		throwKnife(this, this.gameObject.body.center, knifeVel);
	}
}

//This is probably unimportant enough to stay as a function-class
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
		this.knifeStatusText.text = "Throwable Knife: "+(players[0].knife == null);
	
		this.fpsText.position.x = game.camera.position.x+7;
		this.fpsText.position.y = game.camera.position.y+675;
		this.fpsText.text = game.time.fps+" FPS";
	}
	
	this.init();
}
