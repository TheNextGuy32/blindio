window.onload = function(){
  var socket = io({'force new connection': true});
  socket.on('connect', onOpen);
  socket.on('disconnect', onClose)
  socket.on('message', onMessage);
  socket.on('wind', windUpdate);
  //socket.on('new player data', playerData);
}

function onOpen () {
	console.log("Websocket opening");
}

function onClose() {
	console.log("Websocket closing");
}
function onMessage(message) {
	console.dir(message);
};

function windUpdate(wind) {
	console.log(wind.direction);
};

var playerData = {};
function playerData(data) {
	console.log("Recieved player info from game room.");
	console.dir(data);
	playerData = data;
};

