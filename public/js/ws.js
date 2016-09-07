window.onload = function(){
  var ws       = new WebSocket('wss://' + window.location.host + window.location.pathname);
  ws.onopen    = function()  { console.log('websocket opened'); };
  ws.onclose   = function()  { console.log('websocket closed'); }
  ws.onmessage = function(m) { console.log('websocket message: ' +  m.data); };
}