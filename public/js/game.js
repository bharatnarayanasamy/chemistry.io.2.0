//This class is used for defining global variables that can be accessed by any class

//Dictionary of game settings
var gameSettings = {
    playerSpeed: 200,
    maxPowerups: 10,
    maxObstacles: 2,
    powerUpVel: 50,
    obstacleVel: 0,
    ROTATION_SPEED_DEGREES: Phaser.Math.RadToDeg(2 * Math.PI), // 0.5 arc per sec, 2 sec per arc
    TOLERANCE: 0.02 * 1 * Math.PI,
    playerHealth: 100,
}

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1200,
    height: 800,
    backgroundColor: 0x000000,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var lastFired = 0;

var game = new Phaser.Game(config);

function preload() {
    //Loading the images for the bullet types, players, proton, electron and neutrons
    this.load.image("helium", "./assets/images/helium.png");
    this.load.image("heliumbullet", "./assets/images/heliumBullet.png");
    this.load.image("hydrogenbullet", "./assets/images/hydrogenbullet.png");
    this.load.image("hydrogen", "./assets/images/hydrogen.png");
    this.load.image("proton", "./assets/images/proton.png");
    this.load.image("electron", "./assets/images/electron.png");
    this.load.image("neutron", "./assets/images/neutron.png");
    this.load.image("obstacle", "./assets/images/obstacle.png");

    //Setting the maximum number of mouse pointers that can be used on the screen to one
    this.input.maxPointers = 1;
}
function create() {
    //creates instance of socket.io
    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();
    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            } else {
                addOtherPlayers(self, players[id]);
            }
        });
    });
    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });
    this.socket.on('disconnect', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                console.log("player destroyed")
                otherPlayer.destroy();
            }
        });
    });
    this.socket.on('playerMoved', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });


    function addPlayer(self, playerInfo) {
        self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'hydrogen')
        self.player.setScale(.25);
        if (playerInfo.team === 'blue') {
            self.player.setTint(0x0000ff);
        } else {
            self.player.setTint(0xff0000);
        }
        self.player.body.angle = 45;
        self.player.body.setCollideWorldBounds(true);
        self.player.oldPosition = {
            x: self.player.x,
            y: self.player.y,
            rotation: self.player.rotation
        };

        /*
        //physics for players and obstacles
        this.physics.add.collider(self.player, this.obstacles, this.hurtPlayerObs, null, this);
        //physics for player and projectiles
        this.physics.add.overlap(self.player, this.projectiles, this.hurtPlayerProj, null, this);
        //Use physics to stipulate that if a player overlaps with (picks up) a powerup, call function pickPowerUp
        this.physics.add.overlap(self.player, this.powerUps, this.pickPowerUpPlayer, null, this);
        */
    }

    function addOtherPlayers(self, playerInfo) {
        const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'hydrogen')
        if (playerInfo.team === 'blue') {
            otherPlayer.setTint(0x0000ff);
        } else {
            otherPlayer.setTint(0xff0000);
        }
        otherPlayer.playerId = playerInfo.playerId;
        otherPlayer.setScale(.25);
        self.otherPlayers.add(otherPlayer);
    }

    //Setting the background to a gray-ish color
    this.cameras.main.backgroundColor.setTo(200, 200, 200);

    //Displaying the user's current score
    this.scoreLabel = {
        "proton": this.add.text(20, 20, "protons: 0", {
            font: "25px Arial",
            fill: "yellow"
        }), "neutron": this.add.text(20, 50, "neutrons: 0", {
            font: "25px Arial",
            fill: "yellow"
        }), "electron": this.add.text(20, 80, "electrons: 0", {
            font: "25px Arial",
            fill: "yellow"
        })
    };

    this.health = gameSettings.playerHealth;

    this.healthLabel = this.add.text(20, 110, "Health: " + this.health, 16);

    //setting score for all 3 atomic particles to 0
    this.score = {
        "neutron": 0,
        "proton": 0,
        "electron": 0
    };

    //Enabling collisions when an object hits the boundary
    this.physics.world.setBoundsCollision();

    //Create group to hold all our projectiles, aka the bullets
    this.projectiles = this.add.group();

    //used too collect information on keys that were pressed - important for moving the player  
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.cursors = this.input.keyboard.createCursorKeys();

    //collecting information on space bar
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


}

function update(time) {
    if (typeof this.player != "undefined") {
        //player movement
        this.player.body.setVelocity(0);
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-gameSettings.playerSpeed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(gameSettings.playerSpeed);
        }
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-gameSettings.playerSpeed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(gameSettings.playerSpeed);
        }

        if (this.input.keyboard.addKey('A').isDown) {
            this.player.setVelocityX(-gameSettings.playerSpeed);
        } else if (this.input.keyboard.addKey('D').isDown) {
            this.player.setVelocityX(gameSettings.playerSpeed);
        }
        //move up or down
        if (this.input.keyboard.addKey('W').isDown) {
            this.player.setVelocityY(-gameSettings.playerSpeed);
        } else if (this.input.keyboard.addKey('S').isDown) {
            this.player.setVelocityY(gameSettings.playerSpeed);
        }

        //angle pointer
        var angleToPointer = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
        var angleDelta = Phaser.Math.Angle.Wrap(angleToPointer - this.player.rotation);
        //some fancy math stuff I got from online
        if (Phaser.Math.Within(angleDelta, 0, gameSettings.TOLERANCE)) {
            this.player.rotation = angleToPointer;
            this.player.body.setAngularVelocity(0);
        } else {
            this.player.body.setAngularVelocity(Math.sign(angleDelta) * gameSettings.ROTATION_SPEED_DEGREES);
        }

        //calls a function that tells the player sprite to react to keyboard commands 
        //this.player.movePlayerManager(this);

        //tells the barrel of the gun to point wherever the mouse is pointing
        //this.player.pointerMove(this);

        //If mouse clicked and cooldown for shots has elapsed, fire a bullet
        if ((this.input.activePointer.isDown || Phaser.Input.Keyboard.JustDown(this.spacebar)) && time > lastFired) {
            //calls shootBeam function, which fires a bullet
            //calculates angle between player and pointer - helps make sure bullet fires in the direction specified by the pointer
            var angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
            //creates a new bullet object
            var bullet = new Bullet(this, this.player.rotation, this.player);
            //reduces bullet size
            bullet.setScale(.25);
            //changing the angle of the bullet image so it looks better
            var angleInDegrees = (angle * (180 / 3.1415)) + 90;
            bullet.angle += angleInDegrees;
            //starts cooldown period - cannot fire for next 200 miliseconds
            lastFired = time + 200;
        }

        //call each bullet within the projectiles class and updates its location (basically bullet movement)
        for (var i = 0; i < this.projectiles.getChildren().length; i++) {
            var bullet = this.projectiles.getChildren()[i];
            bullet.update();
        }

        if (typeof this.player.oldPosition != "undefined") {
            var x = this.player.x;
            var y = this.player.y;
            var r = this.player.rotation;
            if ((x !== this.player.oldPosition.x || y !== this.player.oldPosition.y || r !== this.player.oldPosition.rotation)) {
                this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, rotation: this.player.rotation });
                console.log(this.player.oldPosition)
            }
        }
        this.player.oldPosition = {
            x: this.player.x,
            y: this.player.y,
            rotation: this.player.rotation,
        };
    }


}

//increments score when player picks up powerup
function pickPowerUpPlayer(player, powerUp) {
    powerUp.destroy();

    this.score[powerUp.texture.key] += 1;
    this.scoreLabel[powerUp.texture.key].text = powerUp.texture.key + ": " + this.score[powerUp.texture.key];

    //upgrading if player score is greater than 
    if (this.score["proton"] > 1 && this.score["neutron"] > 1 && this.score["electron"] > 1) {
        player.upgrade();
    }
}

//increments scoer when player hits powerup with projectile
function pickPowerUpProj(projectile, powerUp) {
    powerUp.destroy();
    projectile.destroy();
    this.score[powerUp.texture.key] += 1;
    this.scoreLabel[powerUp.texture.key].text = powerUp.texture.key + ": " + this.score[powerUp.texture.key];
}

//deals with damage when projectile hits player
function hurtPlayerProj(player, projectile) {
    projectile.destroy();
    if (this.health >= 10) {
        this.health -= 10;
    }
    this.healthLabel.text = "Health: " + this.health;
}

//deals with damage when obstacle hits player
function hurtPlayerObs(player, obstacle) {
    if (this.health >= 10) {
        this.health -= 10;
    }
    this.healthLabel.text = "Health: " + this.health;
}


