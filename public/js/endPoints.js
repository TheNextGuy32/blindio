let socket = {};
let playerUsername = ""; //If you can make this non-global, do so.
let lastTime;

function startServerConnection(){
  playerUsername = document.getElementById("usernameInput").value;
  if(playerUsername == "")
  {
	  document.getElementById("usernameWarning").className = "warningText";
	  return;
  }
  
  socket = io({'force new connection': true});
  
  socket.emit('join', playerUsername);

  socket.on('connect', () => {});
  socket.on('disconnect', ()=> {
  	console.log("Websocket closing");
  });

  socket.on('user-connect', userConnect);
  socket.on('user-disconnect', userDisconnect);
  
  socket.on('wind', windUpdate);
  socket.on('object-states', updatePositions);
  socket.on('load-level', loadLevel);
}

function userConnect (player) {
  console.log("Player named " + player.username + " joined.");
  addPlayer(player.id,player.username);
  //create player with this username, id, and pos
};

function userDisconnect (player) {
  console.log("Player named " + player.username + " left.");
  removePlayer(player.id,player.username);
};

function windUpdate(wind) {
  windDirection = wind.direction;
  windPhase = wind.phase;
};

function updatePositions(objects) {
	
  if(players)
  {
    for(let o = 0 ; o < objects.players.length; o++)
	{
      for(let p = 0 ; p < players.length ; p++)
	  {
        //console.log(objects.players[o].id + " " + players[p].id)
        if(objects.players[o].id === players[p].id)
        {
          players[p].Position = new Phaser.Point(objects.players[o].position[0],objects.players[o].position[1]);
          players[p].Velocity = new Phaser.Point(objects.players[o].velocity[0],objects.players[o].velocity[1]);  
          players[p].Cooldown = objects.players[o].cooldown;
          break;
        }
      }
    }
  }
  if(knives)
  {
    for(let o = 0; o < objects.knives.length; o++)
	{
		for(let k = 0; k < knives.length; k++)
		{
			if(objects.players[o].id === knives[k].id)
			{
				knives[k].Position = new Phaser.Point(objects.knives[o].position[0], objects.knives[o].position[1]);
				knives[k].Velocity = new Phaser.Point(objects.knives[o].velocity[0], objects.knives[o].velocity[1]);
			}
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