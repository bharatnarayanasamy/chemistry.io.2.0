//This is the game scene, where most of the action takes place. 
class Scene2 extends Phaser.Scene {
  constructor() {
    //playGame is the name for this scene
    super("playGame");
  }

  create() {
    //Setting the background to a gray-ish color
    this.cameras.main.backgroundColor.setTo(200,200,200);

    //Displaying the user's current score
    this.scoreLabel = this.add.text(20, 20, "Score: 0", {
      font: "25px Arial",
      fill: "yellow"
    });

    //setting score to 0
    this.score = 0;

    //Enabling collisions when an object hits the boundary
    this.physics.world.setBoundsCollision();

    //creating a group that listens to physics called powerUps which will contain all of our protons/neutrons/electrons
    this.powerUps = this.physics.add.group();
    //Adding either a proton/neutron/electron to the powerUp group, rescaling the sprites for aesthetic purposes
    for (var i = 0; i < gameSettings.maxPowerups; i++) {      
      if (Math.random() > 0.667) {
        var powerUp = this.physics.add.sprite(16, 16, "proton");
        powerUp.setScale(.067);
      } else if (Math.random() > 0.334) {
        var powerUp = this.physics.add.sprite(16, 16, "electron");
        powerUp.setScale(.05);
      }
      else {
        var powerUp = this.physics.add.sprite(16, 16, "neutron");
        powerUp.setScale(.1);
      }
      //adding each powerUp to the powerUps group,
      this.powerUps.add(powerUp);
      //randomizing the initialization location of each power and giving it basic details
      powerUp.setRandomPosition(0, 0, game.config.width, game.config.height);
      powerUp.setVelocity(gameSettings.powerUpVel, gameSettings.powerUpVel);
      powerUp.setCollideWorldBounds(true);
      //powerUp will bounce when it collides with the boundaries
      powerUp.setBounce(1);

    }

    //creating a player sprite with the image named "player"
    this.player = new Player(this, config.width / 2 - 8, config.height - 64);
    
    //player cannot go beyond boundaries
    this.player.body.setCollideWorldBounds(true);

    //Create group to hold all our projectiles, aka the bullets
    this.projectiles = this.add.group();
    //Use physics to stipulate that collisions between a powerUp and a bullet will destroy the projectile
    this.physics.add.collider(this.projectiles, this.powerUps, function (projectile, powerUp) {
      projectile.destroy();
    });
    //Use physics to stipulate that if a player overlaps with (picks up) a powerup, call function pickPowerUp
    this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, null, this);

    //used too collect information on keys that were pressed - important for moving the player  
    this.cursorKeys = this.input.keyboard.createCursorKeys();

  }

  update(time) {
    //calls a function that tells the player sprite to react to keyboard commands 
    this.player.movePlayerManager(this);

    //tells the barrel of the gun to point wherever the mouse is pointing
    this.player.pointerMove(this);
    
    this.input.activePointer

    //If mouse clicked and cooldown for shots has elapsed, fire a bullet
    if (this.input.activePointer.isDown && time > lastFired) {
      //calls shootBeam function, which fires a bullet
      this.shootBeam();
      //starts cooldown period - cannot fire for next 200 miliseconds
      lastFired = time + 200;
    }

    //call each bullet within the projectiles class and updates its location (basically bullet movement)
    for (var i = 0; i < this.projectiles.getChildren().length; i++) {
      var bullet = this.projectiles.getChildren()[i];
      bullet.update();
    }
    
    //finds how many powerUps are remaining in the powerUps group
    var len = this.powerUps.getLength()
    //if less than half of the original number of powerUps are remaining, randomly generate new powerUps
    if (len <= gameSettings.maxPowerups/2) {
      for (var i = 0; i < gameSettings.maxPowerups - len; i++) {        
        if (Math.random() > 0.667) {
          var powerUp = this.physics.add.sprite(16, 16, "proton");
          powerUp.setScale(.067);
        } else if (Math.random() > 0.334) {
          var powerUp = this.physics.add.sprite(16, 16, "electron");
          powerUp.setScale(.05);
        }
        else {
          var powerUp = this.physics.add.sprite(16, 16, "neutron");
          powerUp.setScale(.1);
        }
  
        this.powerUps.add(powerUp);
        powerUp.setRandomPosition(0, 0, game.config.width, game.config.height);
        powerUp.setVelocity(gameSettings.powerUpVel, gameSettings.powerUpVel);
        powerUp.setCollideWorldBounds(true);
        powerUp.setBounce(1);
        console.log("Power Up Added");
      }
    }
    
  }

  //function that fires the bullet
  shootBeam() {
    //calculates angle between player and pointer - helps make sure bullet fires in the direction specified by the pointer
    var angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
    //creates a new bullet object
    var bullet = new Bullet(this, angle);
    //reduces bullet size
    bullet.setScale(.25);
  }

  //increments score when player picks up powerup
  pickPowerUp(player, powerUp) {
    powerUp.destroy();
    this.score +=1;
    this.scoreLabel.text = "Score: " + this.score;

    if (this.score>5) {
      player.setTexture('helium');
    }

  }

}
