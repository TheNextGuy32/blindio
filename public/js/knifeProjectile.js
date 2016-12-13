class Knife
{
	/*
	Member variables:
		id
		gameObject
	*/
	constructor(id)
	{
		this.id = id;
		this.gameObject = game.add.sprite(newPosX, newPosY, 'wallSprite');
		this.gameObject.scale.setTo(10, 10);
		game.physics.enable(this.gameObject);
		this.gameObject.body.immovable = true;
	}
	get Velocity(){return this.gameObject.body.velocity;}
	set Velocity(velPoint) //should be Phaser.Point
	{
		this.gameObject.body.velocity = velPoint;
	}
	get Position(){return this.gameObject.body.position;}
	set Position(posPoint) //should be Phaser.Point
	{
		this.gameObject.x = posPoint.x;
		this.gameObject.y = posPoint.y;
	}
}