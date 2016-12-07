class GameCharacter
{
  /*
  Member variables:
    id
	name
    knife
    gameObject
    score
  */

  constructor(id, name)
  {
    GameCharacter.respawnCharacter(this);
    this.knife = null;
    this.id = id;
	this.name = name;
	this.cooldown = 0;
  }

  update()
  {
    if(this.gameObject.alive)
    {
      game.physics.arcade.collide(this.gameObject, walls);

      for(let i = 0; i < players.length && players[i] != this; i++)
      {
        game.physics.arcade.collide(this.gameObject, players[i].gameObject);
      }
    }

    if(this.knife != null)
    {
      if(this.knife.alive)
      {
        if(game.physics.arcade.overlap(this.knife, walls)) //Knife cutting functions are to be handled either serverside or clientside - these overlap tests are just for looks and might be changed later.
        {
          this.knife.destroy();
          this.knife = null;
        }
        else
        {
          for(let i = 0; i < players.length; i++)
          {
            if(players[i] != this && game.physics.arcade.overlap(this.knife, players[i].gameObject))
            {
              players[i].killCharacter(this.name);
              this.knife.destroy();
              this.knife = null;
              this.score ++;
              break;
            }
          }
        }
      }
      else
      {
        this.knife = null;
      }
    }
  }

  killCharacter(killerName)
  {
    this.gameObject.destroy();

    const timeBeforeRespawn = 3250; //measured in ms
    setTimeout(GameCharacter.respawnCharacter, timeBeforeRespawn, this);

    displayHandler.addNotification(killerName+" KILLED "+this.name);
  }

  static respawnCharacter(charToRespawn)
  {
    //Keeping these as variables seems like a bad idea, but it lets us run the calculations before spawning a player gameobject.
    //We should be fine as long as player GOs keep their size consistent.
    const charWidth = 50;
    const charHeight = 50;

    let newPosX, newPosY, isValidPos;
    do
    {
      isValidPos = true;
      newPosX = 300;//Math.random()*game.world.width;
      newPosY = 300;//Math.random()*game.world.height;
      
      for(let i = 0; i < walls.length; i++)
      {
        let currentWall = walls.getAt(i);
        if(newPosX+charWidth > currentWall.x &&
          newPosX < currentWall.x+currentWall.width &&
          newPosY+charHeight > currentWall.y &&
          newPosY < currentWall.y+currentWall.height)
        {
          isValidPos = false;
          break;
        }
      }
    }while(!isValidPos)

    charToRespawn.gameObject = game.add.sprite(newPosX, newPosY, 'playerSprite');
    game.physics.enable(charToRespawn.gameObject);
    charToRespawn.score = 0;
    
    displayHandler.setOnTop(); //Prevents things from being placed over the HUD text
  }

  throwKnife(vel)
  {
    //Might cause sync issues - reexamine later.
    if(!this.knife)
    {
      throwKnife(this, this.gameObject.body.center, vel);
    }
  }
  throwKnifeAtPointer(pointer)
  {
    if(this.knife) //Safeguarding against null value of knife
    {
      console.log("Invalid Action: Trying to throw a knife while one is already out");
      return;
    }

    let knifeVel = new Phaser.Point(pointer.position.x-(this.gameObject.body.center.x-game.camera.position.x), pointer.position.y-(this.gameObject.body.center.y-game.camera.position.y));
    knifeVel.setMagnitude(800);

    throwKnife(this, this.gameObject.body.center, knifeVel);
  }
  get Cooldown(){return this.cooldown;}
  set Cooldown(num){this.cooldown = num;}
  get Velocity(){return this.gameObject.body.velocity;}
  set Velocity(velPoint) //should be Phaser.Point
  {
    this.gameObject.body.velocity = velPoint;
  }
  get Position(){return this.gameObject.body.position;}
  set Position(posPoint) //should be Phaser.Point
  {
    //this.gameObject.body.position.x = posPoint.x;
    //this.gameObject.body.position.y = posPoint.y;
    // this.gameObject.body.x = posPoint.x;
    // this.gameObject.body.y = posPoint.y;
    this.gameObject.x = posPoint.x;
    this.gameObject.y = posPoint.y;
  }
  get Score() {return this.score;}
  set Score(num)
  {
    this.score = num;
  }
  get Id(){return this.id;}
  get Name(){return this.name;}
}
