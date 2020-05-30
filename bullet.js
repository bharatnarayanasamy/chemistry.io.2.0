// 3.1 NOTE dont forget to add this file in the index.html file
class Bullet extends Phaser.GameObjects.Sprite{
  //scene = scene2, where everything is happening.
  //taking in a scene allows us to access all the information in that scene
  //angle helps determine the direction bullet will travel in
  constructor(scene, angle, player){
    
    //starting location of the bullet. angles help determine whether bullet will start to the left of the 
    //player if gun is pointed leftwards, or right of the player if gun is pointed rightwards
    var x = scene.player.x + 50 * Math.cos(angle);
    var y = scene.player.y + 50 * Math.sin(angle); 

    //use the super constructor to make a GameObject sprite
    super(scene, x, y, "bullet");
  
    //add bullet to the scene
    scene.add.existing(this);

    //enable physics
    scene.physics.world.enableBody(this);

    //set velocity to be some scalar times the vector of OP, where O is the player's coords and P is the pointer's coords
    this.body.velocity.x = Math.cos(angle) * 300; 
    this.body.velocity.y = Math.sin(angle) * 300; 

    //add this (the bullet object) into the projectiles group
    scene.projectiles.add(this);
  }

  update(){
    //get rid of bullet if it travels beyond the boundaries of the map
    if(this.y < 32 ){
      this.destroy();
    }
  }
}
