class GameCharacter
{
  /*
  Member variables:
    name
    knife
    gameObject
    score
  */

  constructor(name)
  {
    GameCharacter.respawnCharacter(this);
    this.knife = null;
    this.name = name;
  }

  update()
  {
    if(this.gameObject.alive)
    {
      this.gameObject.body.immovable = true;
      game.physics.arcade.collide(this.gameObject, windGroup);
      this.gameObject.body.immovable = false;
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
        this.knife.body.immovable = true;
        game.physics.arcade.collide(this.knife, windGroup);
      this.knife.body.immovable = false;

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
      newPosX = Math.random()*game.world.width;
      newPosY = Math.random()*game.world.height;
      
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
    charToRespawn.gameObject.body.collideWorldBounds = true;
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

  get Velocity(){return this.gameObject.body.velocity;}
  set Velocity(velPoint) //should be Phaser.Point
  {
    this.gameObject.body.velocity = velPoint;
  }
  get Position(){return this.gameObject.body.position;}
  set Position(posPoint) //should be Phaser.Point
  {
    this.gameObject.body.position = posPoint;
  }
  get Score() {return this.score;}
  set Score(num)
  {
    this.score = num;
  }
  get Name(){return this.name;}
}