let game, displayHandler, players, knives, walls, level;
let id = "Oliver";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;

function preload()
{
    game.load.image('skyBackground', 'assets/sky.png');
    game.load.image('playerSprite', 'assets/player.png');
    game.load.image('wallSprite', 'assets/wall.png');
    game.load.image('windSprite', 'assets/wind.png');
}

function createWind() {

  windGrid = new WindHolderHolder();
  windGrid.init(WORLD_WIDTH/2, WORLD_HEIGHT/2, WORLD_WIDTH+40, WORLD_HEIGHT+40, 8);
  
  let WIND_INTERVAL = 55;
  for(let x = WIND_INTERVAL/2; x < WORLD_WIDTH; x += WIND_INTERVAL)
  {
    for(let y = WIND_INTERVAL/2; y < WORLD_HEIGHT; y += WIND_INTERVAL)
    {
      let newWind = game.add.sprite(x, y, 'windSprite');
      newWind.scale.setTo(1/5, 1/5);
      game.physics.enable(newWind);
      newWind.body.mass = 0.5;
      windGrid.addWind(newWind);
    }
  }
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);

  //  Create bakcground and hud
  game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'skyBackground');
  game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  displayHandler = new HUD();

  createWind();

  walls = game.add.group();
  walls.enableBody = true;

  for(var w = 0 ; w < level.walls.length ; w++) {
    let newWall = walls.create(level.walls[w].pos[0], level.walls[w].pos[1], 'wallSprite');
    newWall.scale.setTo(level.walls[w].width, level.walls[w].height); //100px wide, 50px tall
    newWall.body.immovable = true;
  }

  players = [];
  
  players.push(new GameCharacter(socket.id, playerUsername));
  game.camera.follow(players[0].gameObject);

  for(var p = 0 ; p < level.players.length ; p++) {
    players.push(new GameCharacter(level.players[p].id, level.players[p].username));
    //  This does not handle positions, the first positions message does
  }
  
  game.input.keyboard.addKeyCapture([MOVEMENT.UP, MOVEMENT.DOWN, MOVEMENT.LEFT, MOVEMENT.RIGHT]);

}
function addPlayer(id,username) {
  players.push(new GameCharacter(id, username));
}
function addKnife(id){
	knives.push(new Knife(id));
}
function removePlayer(id,username) {
  for(var p = 0 ; p < players.length ; p++) {
    if(players[p].id == id) {
      players[p].gameObject.destroy();
      players.splice(p,1);
      break;
    }
  }
}
function removeKnife(id)
{
	for(var k = 0; k < knives.length; k++)
	{
		if(knives[k].id == id)
		{
			knives[k].gameObject.destroy();
			knives.splice(k, 1)
		}
	}
}
let windSpeed = 0;
let windPhase = 0;
let windDirection = 0;
const breezeForce = 3;

function wind() {
  const windSpeed = Math.sin(windPhase) * breezeForce;

  windGrid.update(
    Math.cos(windDirection)*windSpeed, 
    Math.sin(windDirection)*windSpeed);
}

let MOVEMENT =
Object.seal({
    LEFT: Phaser.KeyCode.A,
    RIGHT: Phaser.KeyCode.D,
    UP: Phaser.KeyCode.W,
    DOWN: Phaser.KeyCode.S,
});

function sendInput() {
  socket.emit('input', {
    id: socket.id,
    up: game.input.keyboard.isDown(MOVEMENT.UP) || false,
    right: game.input.keyboard.isDown(MOVEMENT.RIGHT) || false, 
    down: game.input.keyboard.isDown(MOVEMENT.DOWN) || false, 
    left: game.input.keyboard.isDown(MOVEMENT.LEFT) || false, 
    mouseDown: game.input.activePointer.leftButton.isDown || false,
	mouseOffset:  [game.input.activePointer.x-(players[0].gameObject.body.center.x-game.camera.position.x), game.input.activePointer.y-(players[0].gameObject.body.center.y-game.camera.position.y)]
  });
}

function update()
{
  wind();
  sendInput();
  displayHandler.update();
}
