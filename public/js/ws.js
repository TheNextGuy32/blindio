window.onload = function(){
  var socket = io({'force new connection': true});
  socket.on('connect', onOpen);
  socket.on('disconnect', onClose)
}

function onOpen () {
	console.log("Websocket opening");
}

function onClose() {
	console.log("Websocket closing");
}

