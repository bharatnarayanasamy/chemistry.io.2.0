//This is the game scene, where most of the action takes place. 
class Scene2 extends Phaser.Scene {
  constructor() {
    //playGame is the name for this scene
    super("playGame");
  }

  create() {
    //Setting the background to a gray-ish color
    this.cameras.main.backgroundColor.setTo(200,200,200);

    //creating a player sprite with the image named "player"
    this.player = new Player(this, game.config.width / 2 - 8, game.config.height - 64);

    //player cannot go beyond boundaries
    this.player.body.setCollideWorldBounds(true);

    //Displaying the user's current score
    this.scoreLabel = {"proton": this.add.text(20, 20, "protons: 0", {
      font: "25px Arial",
      fill: "yellow"
    }), "neutron": this.add.text(20, 50, "neutrons: 0", {
      font: "25px Arial",
      fill: "yellow"
    }), "electron": this.add.text(20, 80, "electrons: 0", {
      font: "25px Arial",
      fill: "yellow"
    })};

    this.healthLabel = this.add.text(20, 110, "Health: " + this.player.health, 16);
    
    //setting score for all 3 atomic particles to 0
    this.score = {
      "neutron": 0,
      "proton": 0,
      "electron": 0
    };


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

    //adding obstacles
    this.obstacles = this.physics.add.group();

    //looping through obstacles and setting their initial conditions
    for (var i = 0; i < gameSettings.maxObstacles; i++){

      var obstacle = this.physics.add.sprite(75, 75, "obstacle");
      obstacle.setScale(0.45);
      this.obstacles.add(obstacle);
      obstacle.setRandomPosition(20, 20, game.config.width-20, game.config.height-20);
      obstacle.setVelocity(gameSettings.obstacleVel, gameSettings.obstacleVel);
      obstacle.setCollideWorldBounds(true);
      obstacle.setBounce(-1);

    }

    //Create group to hold all our projectiles, aka the bullets
    this.projectiles = this.add.group();

    //physics for projectile and powerups
    this.physics.add.overlap(this.projectiles, this.powerUps, this.pickPowerUpProj, null, this);

    //physics for obstacles and bullets
    this.physics.add.collider(this.projectiles, this.obstacles, function (projectile, obstacle) {
      projectile.destroy();
    });

    //physics for player and obstacles
    this.physics.add.collider(this.player, this.obstacles);

    //physics for player and projectiles
    this.physics.add.overlap(this.player, this.projectiles, this.hurtPlayerProj, null, this);

    //Use physics to stipulate that if a player overlaps with (picks up) a powerup, call function pickPowerUp
    this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUpPlayer, null, this);

    //used too collect information on keys that were pressed - important for moving the player  
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    //collecting information on space bar
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    

  }

  update(time) {
    //calls a function that tells the player sprite to react to keyboard commands 
    this.player.movePlayerManager(this);

    //tells the barrel of the gun to point wherever the mouse is pointing
    this.player.pointerMove(this);
    
    //If mouse clicked and cooldown for shots has elapsed, fire a bullet
    if ((this.input.activePointer.isDown || Phaser.Input.Keyboard.JustDown(this.spacebar)) && time > lastFired) {
      //calls shootBeam function, which fires a bullet
      this.shootBeam(this.player);
      //starts cooldown period - cannot fire for next 200 miliseconds
      lastFired = time + 200;
    }

    //when player is shot, lastShot is updated, same for when player is hurt by obstacles
    if(this.physics.overlap(this.player, this.projectiles)){
      lastShot = time;
    }

    if(this.physics.overlap(this.player, this.obstacles) && time > lastHurt + 1000){
      this.hurtPlayerObs(this.player);
      lastHurt = time;
    }

    if(time > lastShot + 5000 && time > lastHurt + 5000 && time > lastHealed + 5000) {
      this.healPlayer(this.player);
      lastHealed = time;
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
  shootBeam(player) {
    //calculates angle between player and pointer - helps make sure bullet fires in the direction specified by the pointer
    var angle = Phaser.Math.Angle.Between(player.x, player.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
    //creates a new bullet object
    var bullet = new Bullet(this, angle, player);
    //reduces bullet size
    bullet.setScale(.25);
    //changing the angle of the bullet image so it looks better
    var angleInDegrees = (angle * (180/3.1415)) + 90;
    bullet.angle += angleInDegrees;

  }

  //increments score when player picks up powerup
  pickPowerUpPlayer(player, powerUp) {
    powerUp.destroy();

    this.score[powerUp.texture.key] +=1;
    this.scoreLabel[powerUp.texture.key].text = powerUp.texture.key + ": " + this.score[powerUp.texture.key];
    
    //upgrading if player score is greater than 
    if (this.score["proton"]>1 && this.score["neutron"]>1 && this.score["electron"]>1) {
      player.upgrade();
    }
  }

  //increments scoer when player hits powerup with projectile
  pickPowerUpProj(projectile, powerUp) {
    powerUp.destroy();
    projectile.destroy();

    this.score[powerUp.texture.key] +=1;
    this.scoreLabel[powerUp.texture.key].text = powerUp.texture.key + ": " + this.score[powerUp.texture.key];

    //upgrading if player score is greater than 
    if (this.score["proton"]>1 && this.score["neutron"]>1 && this.score["electron"]>1) {
      player.upgrade();
    }
  }

   //deals with damage when projectile hits player
   hurtPlayerProj(player, projectile){
    projectile.destroy();
    if (this.player.health >= 10){
      this.player.health -= 10;
    }
    //in case we have damage that goes by 5s as well
    else if (this.player.health > 0){
      this.player.health = 0;
    }
    this.healthLabel.text = "Health: " + this.player.health;
  }

  //deals with damage when obstacle hits player
  hurtPlayerObs(player, obstacle){
    if (this.player.health >= 10){
      this.player.health -= 10;
    }
    else if (this.player.health > 0){
      this.player.health = 0;
    }
    this.healthLabel.text = "Health: " + this.player.health;
  }

  healPlayer(player){
    if (this.player.health < 80){
      this.player.health += 20;
    }
    else{
      this.player.health = 100;
    }
    this.healthLabel.text = "Health: " + this.player.health;
  }

}
