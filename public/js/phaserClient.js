let game, displayHandler, players, walls, level;
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
  game.input.keyboard.addKeyCapture([MOVEMENT.UP, MOVEMENT.DOWN, MOVEMENT.LEFT, MOVEMENT.RIGHT]);

}
function addPlayer(id,username) {
  players.push(new GameCharacter(id, username));
}
let windSpeed = 0;
let windPhase = 0;
let windDirection = 0;
const breezeForce = 3;

function wind() {
  const windSpeed = Math.sin(windPhase) * breezeForce;

  players.forEach(function(element, index, array) {
    if(element.gameObject.body) {
      element.gameObject.body.immovable = true;
    }
  });
  
  windGrid.update(
    Math.cos(windDirection)*windSpeed, 
    Math.sin(windDirection)*windSpeed);

  players.forEach(function(element, index, array) {
    if(element.gameObject.body) {
      element.gameObject.body.immovable = false;
    }
  });
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
    mouseDown: game.input.activePointer.leftButton.isDown
  });
}

function update()
{
  wind();
  sendInput();
  displayHandler.update();
}
