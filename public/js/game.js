//This class is used for defining global variables that can be accessed by any class

//Dictionary of game settings
var gameSettings = {
    playerSpeed: 200,
    maxPowerups: 10,
    maxObstacles: 2,
    powerUpVel: 50,
    obstacleVel: 0,
    ROTATION_SPEED_DEGREES: Phaser.Math.RadToDeg(2 * Math.PI), // 0.5 arc per sec, 2 sec per arc
    TOLERANCE: 0.04 * 1 * Math.PI,
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
var lastshot = 0;
var lastCollectedP = 0;
var lastCollectedE = 0;
var lastCollectedN = 0;

var numProtonCollected = 0;
var numElectronCollected = 0;
var numNeutronCollected = 0;



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
    this.otherElements = this.physics.add.group();
    this.otherPlayersHP = [];
    this.socket.on('currentPlayers', function (players) {
        //add time delay
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            } else {
                addOtherPlayers(self, players[id]);
            }
        });
    });
    this.socket.on('newPlayer', function (playerInfo) {
        //add time delay
        addOtherPlayers(self, playerInfo);
    });
    this.socket.on('disconnect', function (playerId) {
        //add time delay  
        //destroying other elements
        self.otherElements.getChildren().forEach(function (otherElement) {
            console.log("player disconnected")
            if (playerId === otherElement.playerId) {
                otherElement.destroy();
                console.log("player destroyed")
            }
        });

    });
    this.socket.on('playerMoved', function (playerInfo) {
        //add time delay
        self.otherElements.getChildren().forEach(function (otherElement) {
            if (playerInfo.playerId === otherElement.playerId) {
                otherElement.rotation = playerInfo.rotation;
                otherElement.x = playerInfo.x;
                otherElement.y = playerInfo.y;
            }
        });
    });

    this.socket.on('player-hit', function(i){
        
        console.log("there has been a collision");
        self.element.bullet_array[i].destroy();
        self.element.bullet_array.splice(i,1);
        //self.element.health -= 20;
        
    });

    // Listen for bullet update events 
    this.socket.on('bullets-update', function (server_bullet_array) {
        //add time delay
        // If there's not enough bullets on the client, create themfd
        for (var i = 0; i < server_bullet_array.length; i++) {
            if (self.element.bullet_array[i] == undefined) {

                var angle = Phaser.Math.Angle.Between(self.element.x, self.element.y, self.input.activePointer.worldX, self.input.activePointer.worldY);

                self.element.bullet_array[i] = new Bullet(self, angle, server_bullet_array[i].x, server_bullet_array[i].y);

            } else {
                //Otherwise, just update it! 
                self.element.bullet_array[i].enableBody(true, true);
                self.element.bullet_array[i].x = server_bullet_array[i].x;
                self.element.bullet_array[i].y = server_bullet_array[i].y;
            }
        }
        // Otherwise if there's too many, delete the extra 
        for (var i = server_bullet_array.length; i < self.element.bullet_array.length; i++) {
            self.element.bullet_array[i].destroy();
            self.element.bullet_array.splice(i, 1);
            i--;
        }

    });

    //Old text for
    /*
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
     */

    this.protonScoreText = this.add.text(16, 20, 'Protons: ' + (0), { fontSize: '32px', fill: '#FF0000' });
    this.electronScoreText = this.add.text(16, 50, 'Electrons: ' + (0), { fontSize: '32px', fill: '#FF0000' });
    this.neutronScoreText = this.add.text(16, 80, 'Neutrons: ' + (0), { fontSize: '32px', fill: '#FF0000' });

    this.d = new Date();

    lastCollectedE = 0;
    lastCollectedP = 0;
    lastCollectedN = 0;

    this.oldProtonPosition = {
        x: -5,
        y: -5
    };
    this.oldElectronPosition = {
        x: -5,
        y: -5
    };
    this.oldNeutronPosition = {
        x: -5,
        y: -5
    };

    this.socket.on('protonUpdate', function (proton) {
        if (self.proton) self.proton.destroy();
        self.proton = self.physics.add.image(proton.x, proton.y, 'proton');
        self.proton.setScale(0.08);
        self.physics.add.overlap(self.element, self.proton, function () {
            if(proton.x != this.oldProtonPosition.x || proton.y != this.oldProtonPosition.y) {
                this.protonScoreText.text = 'Protons: ' + (++numProtonCollected);
                this.socket.emit('protonCollected');
                this.oldProtonPosition = {
                    x: proton.x,
                    y: proton.y,
                };
            }
        }, null, self);
    });
    this.socket.on('electronUpdate', function (electron) {
        if (self.electron) self.electron.destroy();
        self.electron = self.physics.add.image(electron.x, electron.y, 'electron');
        self.electron.setScale(0.04);
        self.physics.add.overlap(self.element, self.electron, function () {
            if(electron.x != this.oldElectronPosition.x || electron.y != this.oldElectronPosition.y) {
                this.electronScoreText.text = 'Electrons: ' + (++numElectronCollected);
                this.socket.emit('electronCollected');
                this.oldElectronPosition = {
                    x: electron.x,
                    y: electron.y,
                };
            }
        }, null, self);
    });
    this.socket.on('neutronUpdate', function (neutron) {
        if (self.neutron) self.neutron.destroy();
        self.neutron = self.physics.add.image(neutron.x, neutron.y, 'neutron');
        self.neutron.setScale(0.1);
        self.physics.add.overlap(self.element, self.neutron, function () {
            if(neutron.x != this.oldNeutronPosition.x || neutron.y != this.oldNeutronPosition.y) {
                this.neutronScoreText.text = 'Neutrons: ' + (++numNeutronCollected);
                this.socket.emit('neutronCollected');
                this.oldNeutronPosition = {
                    x: neutron.x,
                    y: neutron.y,
                };
            }
        }, null, self);
    });

    function addPlayer(self, playerInfo) {
        //code for element class
        self.element = new Element(self, playerInfo.x, playerInfo.y, 45, playerInfo.playerId, "hydrogen");

        self.element.oldPosition = {
            x: self.element.x,
            y: self.element.y,
            rotation: self.element.rotation
        };
    }

    function addOtherPlayers(self, playerInfo) {
        const otherElement = new Element(self, playerInfo.x, playerInfo.y, 45, playerInfo.playerId, "hydrogen");
        otherElement.setTint(0x0000ff);
        self.otherElements.add(otherElement);
    }

    //Setting the background to a gray-ish color
    this.cameras.main.backgroundColor.setTo(200, 200, 200);

    this.health = gameSettings.playerHealth;

    this.healthLabel = this.add.text(20, 110, "Health: " + this.health, 16);

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

    //this.socket.emit('timeUpdate', time);
    //console.log(Phaser.Time.Clock.now);

    if (typeof this.element != "undefined") {
        this.element.movePlayer(this);

        if ((this.input.activePointer.isDown || Phaser.Input.Keyboard.JustDown(this.spacebar)) && lastshot < time) {
            var bullet = this.element.shootBullet(this);

            // Tell the server we shot a bullet 
            this.socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bullet.angle, speed_x: bullet.speed_x, speed_y: bullet.speed_y })
            lastshot = time + 500;
        }


        /*
        //call each bullet within the projectiles class and updates its location (basically bullet movement)
        for (var i = 0; i < this.projectiles.getChildren().length; i++) {
            var bullet = this.projectiles.getChildren()[i];
            bullet.update();
        }
        */

        if (typeof this.element.oldPosition != "undefined") {
            var x = this.element.x;
            var y = this.element.y;
            var r = this.element.rotation;
            if ((x !== this.element.oldPosition.x || y !== this.element.oldPosition.y || r !== this.element.oldPosition.rotation)) {
                this.socket.emit('playerMovement', { x: this.element.x, y: this.element.y, rotation: this.element.rotation });
            }
        }
        this.element.oldPosition = {
            x: this.element.x,
            y: this.element.y,
            rotation: this.element.rotation,
        };
    }
}

// Do not venture past this line!

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


