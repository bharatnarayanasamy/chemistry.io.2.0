// 3.1 NOTE dont forget to add this file in the index.html file
class Bullet extends Phaser.GameObjects.Sprite {
  //scene = scene2, where everything is happening.
  //taking in a scene allows us to access all the information in that scene
  //angle helps determine the direction bullet will travel in
  constructor(scene, angle, x, y) {

    //starting location of the bullet. angles help determine whether bullet will start to the left of the 
    //player if gun is pointed leftwards, or right of the player if gun is pointed rightwards
    var x = x + 50 * Math.cos(angle);
    var y = y + 50 * Math.sin(angle);


    //use the super constructor to make a GameObject sprite
    //set bullet texture to be based off of the player's texture
    var texture = "hydrogenbullet";
    super(scene, x, y, texture);

    //add bullet to the scene
    scene.add.existing(this);

    //enable physics
    scene.physics.world.enableBody(this);

    //add this (the bullet object) into the projectiles group
    scene.projectiles.add(this);

    //set velocity to be some scalar times the vector of OP, where O is the player's coords and P is the pointer's coords
    this.setScale(0.25);
    this.body.velocity.x = Math.cos(angle) * 300;
    this.body.velocity.y = Math.sin(angle) * 300;
    var angleInDegrees = (angle * (180 / 3.1415)) + 90;
    this.angle += angleInDegrees;

    //defining some variables needed for the server game loop
    this.x = x;
    this.y = y;
    this.speed_x = this.body.velocity.x;
    this.speed_y = this.body.velocity.y;

  }
}
