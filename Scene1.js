//This is the initial scene that users enter when they load up our game
class Scene1 extends Phaser.Scene {
  constructor() {
    //bootGame is the name for this specific Scene in Phaser
    super("bootGame");
  }

  
  preload(){
    //Loading the images for the bullet types, players, proton, electron and neutrons
    this.load.image("helium", "assets/images/helium.png");
    this.load.image("heliumbullet", "assets/images/heliumBullet.png");
    this.load.image("hydrogenbullet", "assets/images/hydrogenbullet.png");
    this.load.image("hydrogen", "assets/images/hydrogen.png");
    this.load.image("proton", "assets/images/proton.png");
    this.load.image("electron", "assets/images/electron.png");
    this.load.image("neutron", "assets/images/neutron.png");
    
    //Setting the maximum number of mouse pointers that can be used on the screen to one
    this.input.maxPointers = 1;
  }

  create() {
    //Title Screen Text
    this.add.text(20, 20, "Title Screen");

    //Setting the details for different styles
    var default_style = {font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"};
    var over_style = {font: "bold 32px Arial", fill: "#ff0", boundsAlignH: "center", boundsAlignV: "middle"};
    var out_style = {font: "bold 32px Arial", fill: "#0f0", boundsAlignH: "center", boundsAlignV: "middle"};

    //Play Button - click to enter game
    const playButton = this.add.text(config.width/2-100, config.height/2, 'Play Game!', default_style);
    playButton.setInteractive();

    //When button is clicked, transition to the "playGame" scene
    playButton.on('pointerdown', () => {
      this.scene.start("playGame");
    });

    //when mouse hovers over button, change to over_style font style
    playButton.on('pointerover', () => {
      playButton.setStyle(over_style);
    });
    
    //when button is no longer hovered over, change to out_style font style
    playButton.on('pointerout', () => {
      playButton.setStyle(out_style);
    });
  }
}
