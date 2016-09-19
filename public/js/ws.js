window.onload = function(){
  	setupWS();
}

function setupWS () {
  
  const websocketAddress = 
  	(location.hostname === "localhost" ? "ws" : "wss") + '://' + 
  	window.location.host + window.location.pathname;

  console.log("Connecting to " + websocketAddress);

  const ws     = new WebSocket(websocketAddress);
  ws.onopen    = onOpen;
  ws.onclose   = onClose;
  ws.onmessage = onMessage;
}

function onOpen () {
	console.log("Websocket opening");
}

function onClose() {
	console.log("Websocket closing");
}

const responses = {};
// responses.wind = function(data) {

// }
// responses.knife = function(data) {

// }
responses.roomStatus = function(data) {

}
responses.message = function(data) {
  console.log(data.text);
}


function onMessage(m) {
  
  if(!(m.data.type in responses)){
    console.log("Server sent message of unknown type.");
  }
  else
    responses[m.data.type](m.data);
}

