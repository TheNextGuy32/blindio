function WindHolderHolder()
{
  this.windHolderArray = [];
  
  this.init = function(centerX, centerY, width, height, subdivisionsPerAxis)
  {
    for(let xDiv = 0; xDiv < subdivisionsPerAxis; xDiv++)
    {
      for(let yDiv = 0; yDiv < subdivisionsPerAxis; yDiv++)
      {
        this.windHolderArray.push(new WindHolder(this, centerX+(width*-0.5+width*(xDiv+0.5)/subdivisionsPerAxis), centerY+(height*-0.5+height*(yDiv+0.5)/subdivisionsPerAxis), width*(0.5/subdivisionsPerAxis), height*(0.5/subdivisionsPerAxis)));
      }
    }
  }
  
  this.addWind = function(newWind)
  {
    let alreadyAddedToGrid = false;
    for(let i = 0; i < this.windHolderArray.length; i++)
    {
      alreadyAddedToGrid = alreadyAddedToGrid || this.windHolderArray[i].addWind(newWind);
    }
  }
  
  this.update = function(deltaVelX, deltaVelY)
  {
    for(let i = 0; i < this.windHolderArray.length; i++)
    {
      this.windHolderArray[i].update(deltaVelX, deltaVelY);
    }
  }
}

function WindHolder(parentHolder, centerX, centerY, halfWidth, halfHeight)
{
  this.windArray = [];
  
  this.collidesWithBox = function(windToTest)
  {
    return !(windToTest.x+windToTest.width < centerX-halfWidth || windToTest.x > centerX+halfWidth ||
         windToTest.y+windToTest.height < centerY-halfHeight || windToTest.y > centerY+halfHeight);
  }
  
  this.addWind = function(newWind)
  {
    if(this.collidesWithBox(newWind))
    {
      this.windArray.push(newWind);
      return true;
    }
    return false;
  }
  
  this.update = function(deltaVelX, deltaVelY)
  {
    for(let i = 0; i < this.windArray.length; i++)
    {
      if(!this.collidesWithBox(this.windArray[i]))
      {
        parentHolder.addWind(this.windArray[i]);
        this.windArray.splice(i, 1);
        i--;
      }
      else
      {
        //DO WIND UPDATES HERE
        this.windArray[i].body.velocity.x += deltaVelX;
        this.windArray[i].body.velocity.y += deltaVelY;
        
        game.world.wrap(this.windArray[i]);
        game.physics.arcade.collide(this.windArray[i], walls);
        
        for(let h = 0; h < players.length; h++)
        {
          game.physics.arcade.collide(this.windArray[i], players[h].gameObject);
          if(players[h].knife)
          {
            game.physics.arcade.collide(this.windArray[i], players[h].knife);
          }
        }
        for(let h = i+1; h < this.windArray.length; h++)
        {
          game.physics.arcade.collide(this.windArray[i], this.windArray[h]);
        }
      }
    }
  }
}