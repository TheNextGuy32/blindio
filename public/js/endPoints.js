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

function updatePositions(positions) {
	
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