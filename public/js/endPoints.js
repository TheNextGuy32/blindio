var socket = {};
window.onload = function(){
  socket = io({'force new connection': true});
  
  socket.on('connect', ()=> {});
  socket.on('disconnect', ()=> {
  	console.log("Websocket closing");
  });
  
  socket.on('wind', windUpdate);
  socket.on('object-states', updatePositions);
  socket.on('load-level', loadLevel);
}

function windUpdate(wind) {
  windDirection = wind.direction;
  windPhase = wind.phase;
};

function updatePositions(objects) {
  if(!players)
    return;

  for(var o = 0 ; o < objects.players.length; o++) {  
    for(var p = 0 ; p < players.length ; p++) {
      //console.log(objects.players[o].id + " " + players[p].id)
      if(objects.players[o].id === players[p].id)
      {
        players[p].Position = new Phaser.Point(objects.players[o].position[0],objects.players[o].position[1]);
        players[p].Velocity = new Phaser.Point(objects.players[o].velocity[0],objects.players[o].velocity[1]);  
      }
    }
  }
};

function loadLevel(levelInfo) {
  game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update });
  console.log("You are now entering room named: " + levelInfo.roomName);
  level = levelInfo;
};

var playerData = {};
function playerData(data) {
	console.log("Recieved player info from game room.");
	console.dir(data);
	playerData = data;
	socket.emit('player data recieved');
};