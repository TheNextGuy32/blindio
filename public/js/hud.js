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
    this.playerStatusText.text = "Score: "+(players[0].score)+"\nKnife: "+(players[0].Cooldown <= 0 ? "Ready" : players[0].Cooldown);
  
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
