// 3.1 NOTE dont forget to add this file in the index.html file
class Bullet extends Phaser.Physics.Arcade.Sprite {

  //scene = scene2, where everything is happening.
  //taking in a scene allows us to access all the information in that scene
  //angle helps determine the direction bullet will travel in
  constructor(scene, angle, x, y, btexture, speed2) {

    //starting location of the bullet. angles help determine whether bullet will start to the left of the 
    //player if gun is pointed leftwards, or right of the player if gun is pointed rightwards

    console.log(scene);
    if (!(gameSettings.group3.includes(scene.element.atomicNum)) && !(gameSettings.group4.includes(scene.element.atomicNum)))
    {
      var x = x + 20 * Math.cos(angle);
      var y = y + 20 * Math.sin(angle);
    }
    else{
      var x = x - 18 * Math.cos(angle);
      var y = y - 18 * Math.sin(angle);
    }
    //use the super constructor to make a GameObject sprite

    var texture = btexture + "bullet";
    //console.log("bullet texture: ", texture)
    //super(scene, x, y, "hydrogenbullet");
    super(scene, x, y, texture);


    //add bullet to the scene
    scene.add.existing(this);

    //enable physics
    scene.physics.world.enableBody(this);

    //add this (the bullet object) into the projectiles group
    scene.projectiles.add(this);

    this.increment = 1;
    //set velocity to be some scalar times the vector of OP, where O is the player's coords and P is the pointer's coords
    this.setScale(0.4);

    this.speed = speed2;
  
    this.body.velocity.x = Math.cos(angle) * speed2;
    this.body.velocity.y = Math.sin(angle) * speed2;
    console.log(this.body.velocity.x);
    
    this.angle2 = angle;

    var angleInDegrees = (angle * (180 / 3.1415)) + 90;
    this.angle = angleInDegrees;
    
    this.damage = 10;

    //defining some variables needed for the server game loop
    //this.x = x;
    //this.y = y;
    this.speed_x = this.body.velocity.x;
    this.speed_y = this.body.velocity.y;

    this.bulletTexture = btexture;
    //console.log(this.texture);

    this.setVisible(false);
  }

  // changeProperty(ang){
  //   this.body.velocity.x = Math.cos(this.angle2) * atomicNum * 1.5 * gameSettings.bulletSpeed;
  //   this.body.velocity.y = Math.sin(this.angle2) * atomicNum * 1.5 * gameSettings.bulletSpeed;
  //   this.speed_x = this.body.velocity.x;
  //   this.speed_y = this.body.velocity.y;
  // }

  inactive(){
    this.disableBody(true, true);
  }
  active(){
    this.enableBody(true, true);
  }
}
