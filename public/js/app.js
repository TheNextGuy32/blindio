	windGrid = new WindHolderHolder();
	windGrid.init(WORLD_WIDTH/2, WORLD_HEIGHT/2, WORLD_WIDTH+40, WORLD_HEIGHT+40, 8);
	
	let WIND_INTERVAL = 55;
	windGroup = game.add.group();
	windGroup.enableBody = true;
	for(let x = WIND_INTERVAL/2; x < WORLD_WIDTH; x += WIND_INTERVAL)
	{
		for(let y = WIND_INTERVAL/2; y < WORLD_HEIGHT; y += WIND_INTERVAL)
		{
			let newWind = game.add.sprite(x, y, 'windSprite');
			newWind.scale.setTo(1/5, 1/5);
			game.physics.enable(newWind);
			newWind.body.mass = 0.5;
			windGrid.addWind(newWind);
			//newWind.body.velocity.y = -5000;
		}
	}


function update()
{

	//Collision groups
	game.physics.arcade.collide(windGroup, walls);

	//Wind acceleration & world wrap
	windDirection = (breezeRotationSpeed * game.time.time) % (2*Math.PI);//  What direction the wind is pointing
	windPhase = (breezeBackAndForthSpeed * game.time.time) % (2*Math.PI);//  The back and forth sway of wind

	const windSpeed = Math.sin(windPhase) * breezeForce;

	//preventing players from being moved by wind (MIGHT BE UNNECESSARY - TEST THIS AGAIN ONCE SERVER CODE IS UP TO SPEC)
	players.forEach(function(element, index, array) {
		if(element.gameObject.body) {
			element.gameObject.body.immovable = true;
		}
		if(element.knife && element.knife.body) {
			element.knife.body.immovable = true;
		}
	});
	
	windGrid.update(Math.cos(windDirection)*windSpeed, Math.sin(windDirection)*windSpeed);
}