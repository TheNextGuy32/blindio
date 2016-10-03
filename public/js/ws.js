window.onload = function(){
  	setupWS();
}
let ws = {};
function setupWS () {
  
  const websocketAddress = 
  	(location.hostname === "localhost" ? "ws" : "wss") + '://' + 
  	window.location.host + window.location.pathname;

  console.log("Connecting to " + websocketAddress);

  ws           = new WebSocket(websocketAddress);
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

function onMessage(m) {
  var message = JSON.parse(m.data);
  if(!(message.type in responses)){
    console.log(message.data);
  }
  else
    responses[message.type](message.data);
}

//  Responses to server messages

const responses = {};
responses.roomStatus = function(data) {

}
responses.message = function(data) {
  console.log(data);
}
responses.connected = function(data) {
  console.log(data);
  ws.send({type: "console", data: "Glad I'm connected"});
  ws.send({type: "askForRoom", data: {}});
}
responses.joinRoom = function(data)
{
  console.log(data);
  //console.log(`Joined room: #{data.name}`);

}




