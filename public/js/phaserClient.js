let game, displayHandler, players, walls, windGroup, level;
let id = "Oliver";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;

function preload()
{
    game.load.image('skyBackground', 'assets/sky.png');
    game.load.image('playerSprite', 'assets/player.png');
    game.load.image('wallSprite', 'assets/wall.png');
}

function createWind() {
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
    }
  }
}

function create() {

  console.dir(socket);
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

  players.push(new LocalPlayer("Local Player"));
  game.input.keyboard.addKeyCapture([MOVEMENT.UP, MOVEMENT.DOWN, MOVEMENT.LEFT, MOVEMENT.RIGHT]);

}
function addPlayer() {
  players.push(new GameCharacter("Jeff"));
}

let windSpeed = 0;
let windPhase = 0;
let windDirection = 0;
const breezeForce = 3;

function wind() {
  const windSpeed = Math.sin(windPhase) * breezeForce;

  windGroup.forEach(
    function(particle) {
      particle.body.velocity.x += Math.cos(windDirection) * windSpeed;
      particle.body.velocity.y += Math.sin(windDirection) * windSpeed;

      game.world.wrap(particle);
    }, this, true, null);

  //  IS THIS REDUNDANT? //
  game.physics.arcade.collide(windGroup, walls);
}


let MOVEMENT =
Object.seal({
    LEFT: Phaser.KeyCode.A,
    RIGHT: Phaser.KeyCode.D,
    UP: Phaser.KeyCode.W,
    DOWN: Phaser.KeyCode.S,
  DEBUGKEY_CPUKNIFELEFT: Phaser.KeyCode.LEFT,
  DEBUGKEY_CPUKNIFERIGHT: Phaser.KeyCode.RIGHT,
  DEBUGKEY_CPUKNIFEUP: Phaser.KeyCode.UP,
  DEBUGKEY_CPUKNIFEDOWN: Phaser.KeyCode.DOWN,
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

// const breezeRotationSpeed = 0.00005;
// const breezeBackAndForthSpeed = 0.0005;

// players.forEach(function(element, index, array){
//  element.update();

//  //BEGIN DEBUG CONTROLS
//  if(index != 0 && element.gameObject.alive)
//  {
//    element.Velocity = new Phaser.Point((game.input.keyboard.isDown(MOVEMENT.DEBUGKEY_CPURIGHT)-game.input.keyboard.isDown(MOVEMENT.DEBUGKEY_CPULEFT))*300,
//             (game.input.keyboard.isDown(MOVEMENT.DEBUGKEY_CPUDOWN)-game.input.keyboard.isDown(MOVEMENT.DEBUGKEY_CPUUP))*300);

//    if(game.input.keyboard.isDown(MOVEMENT.DEBUGKEY_CPUKNIFERIGHT) || game.input.keyboard.isDown(MOVEMENT.DEBUGKEY_CPUKNIFELEFT) || game.input.keyboard.isDown(MOVEMENT.DEBUGKEY_CPUKNIFEDOWN) || game.input.keyboard.isDown(MOVEMENT.DEBUGKEY_CPUKNIFEUP))
//    {
//      let knifeVelPoint = new Phaser.Point((game.input.keyboard.isDown(MOVEMENT.DEBUGKEY_CPUKNIFERIGHT)-game.input.keyboard.isDown(MOVEMENT.DEBUGKEY_CPUKNIFELEFT)),
//                         (game.input.keyboard.isDown(MOVEMENT.DEBUGKEY_CPUKNIFEDOWN)-game.input.keyboard.isDown(MOVEMENT.DEBUGKEY_CPUKNIFEUP)));
//      knifeVelPoint.setMagnitude(800);
//      element.throwKnife(knifeVelPoint);
//    }
//  }
//  //END DEBUG CONTROLS
// });


// function throwKnife(player, posPoint, velPoint)
// {
//  player.knife = game.add.sprite(posPoint.x, posPoint.y, 'wallSprite');
//  game.physics.enable(player.knife);
//  player.knife.checkWorldBounds = true;
//  player.knife.outOfBoundsKill = true;
//  player.knife.body.immovable = true;
//  player.knife.scale.setTo(1/5, 1/5);

//  player.knife.body.center = posPoint;
//  player.knife.body.velocity = velPoint;
// }