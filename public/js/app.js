"use strict";

let game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update });
let localPlayer, displayHandler, otherPlayers, otherPlayerGameObjects, cursors, walls, knifeStatusText, fpsText, windQuadtree, windArray;
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
const breezeForce = 1.5;
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
	
	let WIND_INTERVAL = 50;
	windQuadtree = new WindTree(game.world.centerX, game.world.centerY, WORLD_WIDTH/2, WORLD_HEIGHT/2, 0);
	windArray = [];
	for(let x = WIND_INTERVAL/2; x < WORLD_WIDTH; x += WIND_INTERVAL)
	{
		for(let y = WIND_INTERVAL/2; y < WORLD_HEIGHT; y += WIND_INTERVAL)
		{
			let newWind = game.add.sprite(x, y, 'playerSprite');
			newWind.enableBody = true;
			game.physics.enable(newWind);
			newWind.scale.setTo(1/5, 1/5);
			newWind.body.mass = 0.5;
			windQuadtree.addWind(newWind);
			windArray.push(newWind);
			//newWind.body.velocity.y = -5000;
		}
	}
	
	localPlayer = new Player();
	localPlayer.init(game.world.width/2, game.world.height/2, "Player");	//Todo: Update function to feature random-ish starting locations, player name as seen by server
	
	otherPlayerGameObjects = game.add.group();
	otherPlayerGameObjects.enableBody = true;
	otherPlayers = [];
	otherPlayers.push(new NPC());
	otherPlayers[0].init(3*game.world.width/4, game.world.height/3, "CPU Player #1", otherPlayerGameObjects);
	otherPlayers.push(new NPC());
	otherPlayers[1].init(game.world.width/4, 2*game.world.height/3, "CPU Player #2", otherPlayerGameObjects);


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
	
	//Wind acceleration calcs
	let windDirection = (breezeRotationSpeed * game.time.time) % (2*Math.PI);//  What direction the wind is pointing
	let windPhase = (breezeBackAndForthSpeed * game.time.time) % (2*Math.PI);//  The back and forth sway of wind
	let windSpeed = Math.sin(windPhase) * breezeForce;
	
	let windVelDeltaX = Math.cos(windDirection)*windSpeed;
	let windVelDeltaY = Math.sin(windDirection)*windSpeed;
	windArray.forEach(function(element, index, array)
	{
		element.body.velocity.x += windVelDeltaX;
		element.body.velocity.y += windVelDeltaY;
		game.world.wrap(element);
		game.physics.arcade.collide(element, localPlayer.knife);
		game.physics.arcade.collide(element, localPlayer.gameObject);
		game.physics.arcade.collide(element, walls);
	});
	
	//Updating things
	localPlayer.update();
	otherPlayers.forEach(function(element, index, array){element.update();});
	windQuadtree.updateWind();
	
	//HUD text (TODO: FIGURE OUT HOW TO PROPERLY ANCHOR TEXT TO CAMERA)
	displayHandler.update();
}

function throwKnife(player, posPoint, velPoint)
{
	player.knife = game.add.sprite(posPoint.x, posPoint.y, 'wallSprite');
	game.physics.enable(localPlayer.knife);
	player.knife.checkWorldBounds = true;
	player.knife.outOfBoundsKill = true;
	player.knife.body.immovable = true;
	player.knife.scale.setTo(1/5, 1/5);
	
	player.knife.body.center = posPoint;
	player.knife.body.velocity = velPoint;
}

//Overlap functions
function knifeHitsWall(knife, wall)
{
	console.log("YOU KNIFED A WALL");
//	knife.destroy(); //This is dangerous when we're dealing with sprite-vs-group overlaps, so I'm using the bool the overlap test returns to destroy the knife in the player's update.
	//This function isn't being called, since it does absolutely nothing at the moment, but I'm leaving it here in case we want to do something with it. Play a sound, for instance.
}

function knifeHitsPlayer(knife, player)
{
	console.log("YOU KNIFED A PLAYER");
//	knife.destroy(); //See knifeHitsWall.
	player.destroy();
}

//Function-objects below. Normally I'd put them into their own object, but I want to avoid bloating the number of js files for now. It sacrifices the readability of this one a bit, but Ctrl+F never stopped being a thing.
function Player()
{
	this.name = "Unassigned Player";
	this.knife = null;
	this.moveSpeed = 300;
	this.knifeSpeed = 800;
	this.gameObject;
	
	this.init = function(x, y, name)
	{
		this.gameObject = game.add.sprite(x, y, 'playerSprite');
		game.physics.enable(this.gameObject);
		this.gameObject.body.immovable = true;
		this.gameObject.body.collideWorldBounds = true;
		game.camera.follow(this.gameObject);
	}
	
	this.update = function()
	{
		//Collision
		game.physics.arcade.collide(this.gameObject, walls);
		game.physics.arcade.collide(this.gameObject, otherPlayerGameObjects);
		
		//Knife maintenance
		if(this.knife != null)
		{
			if(this.knife.alive)
			{
				if(game.physics.arcade.overlap(this.knife, otherPlayerGameObjects, knifeHitsPlayer) || game.physics.arcade.overlap(this.knife, walls))
				{
					this.knife.destroy();
					this.knife = null;
				}
			}
			else
			{
				//Will be called primarily when knives have left game borders.
				this.knife = null;
			}
		}
		
		//Movement
		this.gameObject.body.velocity.x = (game.input.keyboard.isDown(MOVEMENT.RIGHT)-game.input.keyboard.isDown(MOVEMENT.LEFT))*this.moveSpeed;
		this.gameObject.body.velocity.y = (game.input.keyboard.isDown(MOVEMENT.DOWN)-game.input.keyboard.isDown(MOVEMENT.UP))*this.moveSpeed;
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
	
		throwKnife(this, this.gameObject.body.center, knifeVel);
	}
}

function NPC()
{
	this.name = "Unassigned player";
	this.knife = null;
	this.gameObject;
	this.init = function(x, y, name, group)
	{
		this.gameObject = group.create(x, y, 'playerSprite');
		this.name = name;
	}
	
	this.update = function()
	{
		if(this.knife != null)
		{
			if(this.knife.alive)
			{
				game.physics.arcade.collide(this.knife, windGroup); //Todo: Consider replacing with overlap function or playing with mass values.
				
				if(game.physics.arcade.overlap(this.knife, otherPlayerGameObjects) || game.physics.arcade.overlap(this.knife, walls)) //Knife cutting funcions are to be handled either serverside or clientside - these overlap tests are just for looks and might be changed later.
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
	}
	
	this.changeVelocity = function(newVel)
	{
		this.gameObject.body.velocity = newVel;
	}
	
	this.changePosition = function(newPos)
	{
		this.gameObject.body.position = newPos;
	}
	
	this.throwKnife = function(vel)
	{
		throwKnife(this, this.gameObject.body.center, knifeVel);
	}
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

function WindTree(centerX, centerY, halfWidth, halfHeight, branchNum)
{
	const maxWindBeforeSplitting = 10;
	this.parentTree = null;
	this.subTrees = [];
	this.windGroup = [];
	
	this.intersectsTree = function(gameObjectToTest)
	{
		return !(gameObjectToTest.body.center.x+gameObjectToTest.body.width/2 < centerX-halfWidth || gameObjectToTest.body.center.x-gameObjectToTest.body.width/2 > centerX+halfWidth ||
				 gameObjectToTest.body.center.y+gameObjectToTest.body.height/2 < centerY-halfHeight || gameObjectToTest.body.center.y-gameObjectToTest.body.height/2 > centerY+halfHeight);
	}
	
	this.updateWind = function()
	{
		for(let i = 0; i < this.windGroup.length; i++)
		{
			//Originally this loop just tested against every wind prior to i (so that each pair is only tested once), but when that failed to work properly it was expanded to the full array. Bug squashed?
			for(let h = 0; h < this.windGroup.length; h++)
			{
				game.physics.arcade.collide(this.windGroup[i], this.windGroup[h]);
			}
			
			//Check if wind particle is in box
			if(!this.intersectsTree(this.windGroup[i]) && this.parentTree != null)
			{
				//if not, remove from array and add to parent tree
				this.parentTree.addWind((this.windGroup.splice(i, 1)[0]));
				i--;
			}
		}
		//And repeat for each subtree.
		this.subTrees.forEach(function(element, index, array){element.updateWind();});
	}
	
	this.addWind = function(newWind)
	{
		//if newWind isn't in treebox, we don't care about it.
		if(!this.intersectsTree(newWind))
		{
			return;
		}
		
		if(this.subTrees.length > 0)
		{
			//We have subtrees, therefore anything stored in this branch is redundant at best.
			this.subTrees.forEach(function(element, index, array){element.addWind(newWind);});
		}
		else
		{
			this.windGroup.push(newWind);
			
			if(this.windGroup.length+1 > maxWindBeforeSplitting)
			{
				//We have no subtrees, but this branch will be over capacity if newWind is kept in. Time to branch.
				this.branchTree();
				while(this.windGroup.length > 0)
				{
					let windToRelocate = this.windGroup.splice(0, 1)[0];
					for(let i = 0; i < this.subTrees.length; i++)
					{
						this.subTrees[i].addWind(windToRelocate);
					}
				}
			}
		}
	}
	
	//should be private and/or just inside the addWind function, but whatever.
	this.branchTree = function()
	{
		const quarterWidth = halfWidth/2;
		const quarterHeight = halfHeight/2;
		this.subTrees.push(new WindTree(centerX-quarterWidth, centerY-quarterHeight, quarterWidth, quarterHeight, branchNum+1));
		this.subTrees.push(new WindTree(centerX+quarterWidth, centerY-quarterHeight, quarterWidth, quarterHeight, branchNum+1));
		this.subTrees.push(new WindTree(centerX-quarterWidth, centerY+quarterHeight, quarterWidth, quarterHeight, branchNum+1));
		this.subTrees.push(new WindTree(centerX+quarterWidth, centerY+quarterHeight, quarterWidth, quarterHeight, branchNum+1));
		for(let i = 0; i < this.subTrees.length; i++)
		{
			this.subTrees[i].parentTree = this;
		}
	}
}
