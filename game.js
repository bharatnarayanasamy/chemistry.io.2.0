//This class is used for defining global variables that can be accessed by any class

//Dictionary of game settings
var gameSettings = {
  playerSpeed: 200,
  maxPowerups: 10,
  powerUpVel: 50,
  ROTATION_SPEED_DEGREES: Phaser.Math.RadToDeg(1 * Math.PI), // 0.5 arc per sec, 2 sec per arc
  TOLERANCE: 0.02 * 1 * Math.PI,
}

//Dictionary of configurations for our specific Phaser game
var config = {
  width: 1200,
  height: 800,
  backgroundColor: 0x000000,
  scene: [Scene1, Scene2],
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade:{
        debug: false
    }
  }
}

//Creating a Phaser game with the aforementioned configurations
var game = new Phaser.Game(config);

//Setting default value of lastFired to 0. Used to enforce delay between shots
var lastFired = 0;