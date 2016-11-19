class LocalPlayer extends GameCharacter
{
  /*
  New Member Variables:
    moveSpeed
  */
  constructor(id)
  {
    super(id);
    this.moveSpeed = 300;
    game.camera.follow(this.gameObject);
    game.input.onDown.add(this.throwKnifeAtPointer, this);
  }

  update()
  {
    super.update();
    if(this.gameObject.alive)
    {
      this.Velocity = new Phaser.Point((game.input.keyboard.isDown(MOVEMENT.RIGHT)-game.input.keyboard.isDown(MOVEMENT.LEFT))*this.moveSpeed,
                       (game.input.keyboard.isDown(MOVEMENT.DOWN)-game.input.keyboard.isDown(MOVEMENT.UP))*this.moveSpeed);
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

  killCharacter(killerId)
  {
    this.gameObject.destroy();

    const timeBeforeRespawn = 3250; //measured in ms
    setTimeout(LocalPlayer.respawnCharacter, timeBeforeRespawn, this);

    displayHandler.addNotification(killerId+" KILLED "+this.id);
    for(let i = 1; i <= timeBeforeRespawn/1000; i++)
    {
      setTimeout(function(){displayHandler.addNotification("RESPAWNING IN "+i+"...");}, timeBeforeRespawn-i*1000, this);
    }
  }

  static respawnCharacter(charToRespawn)
  {
    GameCharacter.respawnCharacter(charToRespawn);
    game.camera.follow(charToRespawn.gameObject);
  }
}

//This is probably unimportant enough to stay as a function-class
function HUD()
{
  this.playerStatusText;
  this.fpsText;
  this.eventLogText;

  this.eventStringArray;

  this.init = function()
  {
    this.playerStatusText = game.add.text(7, 10, "");
    this.playerStatusText.stroke = "#000";
    this.playerStatusText.fill = "#fff";
    this.playerStatusText.strokeThickness = 5;
    this.playerStatusText.fixedToCamera = true;

    this.fpsText = game.add.text(7, 675, "");
    this.fpsText.fixedToCamera = true;
    this.fpsText.stroke = "#000";
    this.fpsText.fill = "#fff";
    this.fpsText.strokeThickness = 5;
    game.time.advancedTiming = true;

    this.eventStringArray = [];
    this.eventLogText = game.add.text(game.camera.width/2, 10, "");
    this.eventLogText.fixedToCamera = true;
    this.eventLogText.wordWrap = true;
    this.eventLogText.wordWrapWidth = game.camera.width/2-7;
    this.eventLogText.stroke = "#000";
    this.eventLogText.fill = "#fff";
    this.eventLogText.strokeThickness = 5;
  }

  this.setOnTop = function()
  {
    this.playerStatusText.bringToTop();
    this.fpsText.bringToTop();
    this.eventLogText.bringToTop();
  }

  this.update = function()
  {
    this.playerStatusText.text = "Score: "+(players[0].score)+"\nThrowable Knife: "+(players[0].knife == null);
  
    this.fpsText.text = game.time.fps+" FPS";
  }

  this.addNotification = function(newEventString)
  {
    this.eventStringArray.push(newEventString);
    this.rewriteEventLogText();

    const timeBeforeRemoval = 3000; //measured in ms
    setTimeout(this.removeOldestNotification, timeBeforeRemoval, this);
  }

  this.removeOldestNotification = function(ObjectToRemove)
  {
    ObjectToRemove.eventStringArray.shift();
    ObjectToRemove.rewriteEventLogText();
  }

  this.rewriteEventLogText = function()
  {
    this.eventLogText.text = "";
    for(let i = 0; i < this.eventStringArray.length; i++)
    {
      this.eventLogText.text += this.eventStringArray[i]+"\n";
    }
  }

  this.init();
}
