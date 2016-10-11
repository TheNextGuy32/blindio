//const phaser = require('phaser');

class GameCharacter
{
  get name() {
    return this.name;
  }
  get velocity() {
    return this.gameObject.body.velocity;
  }
  set velocity(newVelocity) {
    this.gameObject.body.velocity.x = newVelocity.x;
    this.gameObject.body.velocity.y = newVelocity.y;
  }
  get position() {
    return this.gameObject.body.position;
  }
  set position(newPosition) {
    this.gameObject.body.position.x = newPosition.x;
    this.gameObject.body.position.y = newPosition.y;
  }

  constructor(x, y, name) {

    this.name = name != null ? name : "Nameless Player" ; 
    this.knife = null;

    this.moveSpeed = 300;

    this.gameObject = game.add.sprite(x, y, 'playerSprite');
    game.physics.enable(this.gameObject);
    this.gameObject.body.collideWorldBounds = true;
  }

  update() {
    // if (this.knife != null)
    // {
    //   if (this.knife.alive)
    //   {
    //     game.physics.arcade.collide(this.knife, windGroup); // Todo: Consider replacing with overlap function or playing with mass values.

    //     if (game.physics.arcade.overlap(this.knife, walls)) // Knife cutting functions are to be handled either serverside or clientside - these overlap tests are just for looks and might be changed later.
    //     {
    //       this.knife.destroy();
    //       this.knife = null;
    //     }
    //     else
    //     {
    //       for (let i = 0; i < players.length; i++)
    //       {
    //         if (players[i] != this && game.physics.arcade.overlap(this.knife, players[i].gameObject))
    //         {
    //           players[i].gameObject.destroy(); // TODO: Replace this with something better
    //           this.knife.destroy();
    //           this.knife = null;
    //           break;
    //         }
    //       }
    //     }
    //   }
    //   else
    //   {
    //     this.knife = null;
    //   }
    // }
  }
}
