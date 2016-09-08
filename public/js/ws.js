window.onload = function(){
  var websocketAddress = (location.hostname === "localhost" ? "ws" : "wss") + '://' + window.location.host + window.location.pathname;
  console.log("Connecting to " + websocketAddress)
  var ws       = new WebSocket(websocketAddress);
  ws.onopen    = function()  { console.log('websocket opened'); };
  ws.onclose   = function()  { console.log('websocket closed'); }
  ws.onmessage = function(m) { console.log('websocket message: ' +  m.data); };
}