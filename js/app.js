var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var player, cursors, walls;

function preload() {
    game.load.image('skyBackground', 'assets/sky.png');
    game.load.image('playerSprite', 'assets/player.png');
    game.load.image('wallSprite', 'assets/wall.png');
}

function create() {
    
    game.physics.startSystem(Phaser.Physics.ARCADE);

	//Adding things to world
	//Stuff is rendered in the order it's added (back to front)
	//Desired order: Background < Knives (to be added later) < Wind (later) < Players < Walls
	
    game.add.sprite(0, 0, 'skyBackground');

	player = game.add.sprite(game.world.width/2, game.world.height/2, 'playerSprite');
	game.physics.enable(player);
	player.body.gravity.y = 0;
	player.body.collideWorldBounds = true;


	walls = game.add.group();
	walls.enableBody = true;
	
	//Wallsprite is 50px*50px, scale is multiplicative
	var newWall = walls.create(game.world.width/4-25, game.world.height/4-25, 'wallSprite');
	newWall.scale.setTo(2, 1);
	newWall.body.immovable = true;
	
	newWall = walls.create(2*game.world.width/3, 3*game.world.height/4-75, 'wallSprite');
	newWall.scale.setTo(1, 3);
	newWall.body.immovable = true;
	
	
	//Todo in the future: Change arrow keys to WASD
    cursors = game.input.keyboard.createCursorKeys();
}

function update() {
	game.physics.arcade.collide(player, walls);
	
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
}