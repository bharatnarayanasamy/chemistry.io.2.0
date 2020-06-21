//This class is used for defining global letiables that can be accessed by any class

//Dictionary of game settings
var gameSettings = {
    playerSpeed: 300,
    maxPowerups: 10,
    maxObstacles: 2,
    powerUpVel: 50,
    obstacleVel: 0,
    ROTATION_SPEED_DEGREES: Phaser.Math.RadToDeg(2 * Math.PI), // 0.5 arc per sec, 2 sec per arc
    TOLERANCE: 0.04 * 1 * Math.PI,
    playerHealth: 100,
    texture: ["hydrogen", "helium", "obstacle", "vrishabkrishna"],
    upgradePEN: 5
}

let config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1200,
    height: 800,
    backgroundColor: 0x000000,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            debugShowBody: true,
            debugShowStaticBody: true,
            //gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var lastShot = 0;
var lastHealed = 0;

var game = new Phaser.Game(config);

function preload() {
    //Loading the images for the bullet types, players, proton, electron and neutrons
    this.load.image("helium", "./assets/images/helium.png");
    this.load.image("heliumbullet", "./assets/images/heliumbullet.png");
    this.load.image("hydrogenbullet", "./assets/images/hydrogenbullet.png");
    this.load.image("hydrogen", "./assets/images/hydrogen.png");
    this.load.image("proton", "./assets/images/proton.svg");
    this.load.image("electron", "./assets/images/electron.svg");
    this.load.image("neutron", "./assets/images/neutron.svg");
    this.load.image("obstacle", "./assets/images/lithium.png");
    this.load.image("vrishabkrishna", "./assets/images/vrishabkrishna.png");
<<<<<<< HEAD
    this.load.image("bg", "./assets/images/dope.png");
=======
>>>>>>> 1dccc816aed86dc82b255773c7fe71f731a09c9a

    //Setting the maximum number of mouse pointerjjs that can be used on the screen to one
    this.input.maxPointers = 1;
}
function create() {
    //creates instance of socket.io
    let self = this;
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
                otherElement.hp.destroy()
                otherElement.destroy();
                console.log("player destroyed")
            }
        });
    });

    this.socket.on('deleteDeadPlayers', function (playerId) {
        self.otherElements.getChildren().forEach(function (otherElement) {
            console.log("player disconnected")
            if (playerId === otherElement.playerId) {
                otherElement.hp.destroy()
                otherElement.destroy();
                console.log("player destroyed")
            }
        });
    });



    this.socket.on('playerMoved', function (playerInfo) {
        //add time delay
        self.otherElements.getChildren().forEach(function (otherElement) {
            if (playerInfo.playerId === otherElement.playerId) {
                
                otherElement.body.setVelocity(0);
                otherElement.body.setVelocityX(playerInfo.vx);
                otherElement.body.setVelocityY(playerInfo.vy);
                otherElement.rotation = playerInfo.rotation;
                otherElement.body.setCollideWorldBounds(true);
                otherElement.hp.move(self, otherElement.x - 40, otherElement.y + 70);
            }
        });
    });

    this.socket.on('update-health', function (player) {
        if (player.playerId == self.socket.id) {
            self.element.hp.set(player.health);
        }
        else {
            self.otherElements.getChildren().forEach(function (otherElement) {
                if (player.playerId === otherElement.playerId) {
                    otherElement.hp.set(player.health);
                }
            });
        }
        if (self.element.hp.value <= 0) {
            if (confirm('Refresh to Play Again')) {
                window.location.reload();
            }
        }
    });

    this.socket.on('playerUpgraded', function (playerInfo) {
        self.otherElements.getChildren().forEach(function (otherElement) {
            if (playerInfo.playerId == otherElement.playerId) {
                otherElement.atomicNum = playerInfo.atomicNumServer;
                if (playerInfo.atomicNumServer < 5) {
                    otherElement.setTexture(this.gameSettings.texture[otherElement.atomicNum - 1]);
                }
            }
        });

    });

    // Listen for bullet update events 
    this.socket.on('bullets-update', function (server_bullet_array) {
        //add time delay
        // If there's not enough bullets on the client, create themfd
        for (let i = 0; i < server_bullet_array.length; i++) {
            if (self.element.bullet_array[i] == undefined) {

                let angle = Phaser.Math.Angle.Between(self.element.x, self.element.y, self.input.activePointer.worldX, self.input.activePointer.worldY);
                self.element.bullet_array[i] = new Bullet(self, angle, server_bullet_array[i].x, server_bullet_array[i].y);
                /*
                console.log(self.socket.id);
                console.log(server_bullet_array[i].owner_id)
                console.log(self.socket.id == server_bullet_array[i].owner_id)
                */
                if (self.socket.id != server_bullet_array[i].owner_id) {
                    self.element.bullet_array[i].setTint(0xff0000);
                }

            } else {
                //Otherwise, just update it! 

                self.element.bullet_array[i].enableBody(true, true);

                if (self.element.bullet_array[i].texture == 'helium') {
                    console.log("player has changed to helium");
                    //self.element.bullet_array[i].changeProperty()




                }
                self.element.bullet_array[i].x = server_bullet_array[i].x;
                self.element.bullet_array[i].y = server_bullet_array[i].y;
            }
        }
        // Otherwise if there's too many, delete the extra 
        for (let i = server_bullet_array.length; i < self.element.bullet_array.length; i++) {
            self.element.bullet_array[i].destroy();
            self.element.bullet_array.splice(i, 1);
            i--;
        }

    });


    this.numProtons = 0;
    this.numElectrons = 0;
    this.numNeutrons = 0;


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

    //creates scorebars at bottom of screen
    this.protonBar = new CollectionBar(this, config.width / 2 - 150, config.height - 120, "proton", 0);
    this.protonBarText = this.add.text(config.width / 2 - 60, config.height - 118, 'Protons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });
    this.electronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 80, "electron");
    this.electronBarText = this.add.text(config.width / 2 - 60, config.height - 78, 'Electrons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });
    this.neutronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 40, "neutron");
    this.neutronBarText = this.add.text(config.width / 2 - 60, config.height - 38, 'Neutrons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });

    this.socket.on('protonUpdate', function (proton) {
        if (self.proton) self.proton.destroy(); //prevents duplicates?
        self.proton = self.physics.add.image(proton.x, proton.y, 'proton');
        self.proton.setScale(0.08);
        //code for when players and protons overlap
        self.physics.add.overlap(self.element, self.proton, function () {
            //if proton is not in same position, update the score bar
            if (proton.x != this.oldProtonPosition.x || proton.y != this.oldProtonPosition.y) {
                if (this.numProtons < gameSettings.upgradePEN) {
                    this.numProtons++;
                    this.protonBar = new CollectionBar(this, config.width / 2 - 150, config.height - 120, "proton", this.numProtons * 100 / gameSettings.upgradePEN);
                    this.protonBarText = this.add.text(config.width / 2 - 60, config.height - 118, 'Protons: ' + this.numProtons + '/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });
                }
                //level up if player has collected sufficient number of -tons
                if (this.numNeutrons == gameSettings.upgradePEN && this.numProtons == gameSettings.upgradePEN && this.numElectrons == gameSettings.upgradePEN) {
                    self.element.atomicNum++;
                    this.numNeutrons = 0;
                    this.numProtons = 0;
                    this.numElectrons = 0;

                    this.protonBar = new CollectionBar(this, config.width / 2 - 150, config.height - 120, "proton", 0);
                    this.protonBarText = this.add.text(config.width / 2 - 60, config.height - 118, 'Protons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });
                    this.electronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 80, "electron");
                    this.electronBarText = this.add.text(config.width / 2 - 60, config.height - 78, 'Electrons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });
                    this.neutronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 40, "neutron");
                    this.neutronBarText = this.add.text(config.width / 2 - 60, config.height - 38, 'Neutrons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });

                    self.element.upgrade();
                    self.socket.emit('upgrade', self.element.atomicNum);
                }

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
            if (electron.x != this.oldElectronPosition.x || electron.y != this.oldElectronPosition.y) {
                if (this.numElectrons < gameSettings.upgradePEN) {
                    this.numElectrons++;
                    this.electronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 80, "electron", this.numElectrons * 100 / gameSettings.upgradePEN);
                    this.electronBarText = this.add.text(config.width / 2 - 60, config.height - 78, 'Electrons: ' + this.numElectrons + '/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });

                }

                if (this.numNeutrons == gameSettings.upgradePEN && this.numProtons == gameSettings.upgradePEN && this.numElectrons == gameSettings.upgradePEN) {
                    self.element.atomicNum++;
                    this.numNeutrons = 0;
                    this.numProtons = 0;
                    this.numElectrons = 0;

                    this.protonBar = new CollectionBar(this, config.width / 2 - 150, config.height - 120, "proton", 0);
                    this.protonBarText = this.add.text(config.width / 2 - 60, config.height - 118, 'Protons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });
                    this.electronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 80, "electron");
                    this.electronBarText = this.add.text(config.width / 2 - 60, config.height - 78, 'Electrons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });
                    this.neutronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 40, "neutron");
                    this.neutronBarText = this.add.text(config.width / 2 - 60, config.height - 38, 'Neutrons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });

                    self.element.upgrade();
                    self.socket.emit('upgrade', self.element.atomicNum);
                }

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
            if (neutron.x != this.oldNeutronPosition.x || neutron.y != this.oldNeutronPosition.y) {
                if (this.numNeutrons < gameSettings.upgradePEN) {
                    this.numNeutrons++;
                    this.neutronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 40, "neutron", this.numNeutrons * 100 / gameSettings.upgradePEN);
                    this.neutronBarText = this.add.text(config.width / 2 - 60, config.height - 38, 'Neutrons: ' + this.numNeutrons + '/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });

                }

                if (this.numNeutrons == gameSettings.upgradePEN && this.numProtons == gameSettings.upgradePEN && this.numElectrons == gameSettings.upgradePEN) {
                    self.element.atomicNum++;
                    this.numNeutrons = 0;
                    this.numProtons = 0;
                    this.numElectrons = 0;

                    this.protonBar = new CollectionBar(this, config.width / 2 - 150, config.height - 120, "proton", 0);
                    this.protonBarText = this.add.text(config.width / 2 - 60, config.height - 118, 'Protons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });
                    this.electronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 80, "electron");
                    this.electronBarText = this.add.text(config.width / 2 - 60, config.height - 78, 'Electrons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });
                    this.neutronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 40, "neutron");
                    this.neutronBarText = this.add.text(config.width / 2 - 60, config.height - 38, 'Neutrons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });

                    self.element.upgrade();
                    self.socket.emit('upgrade', self.element.atomicNum);
                }

                this.socket.emit('neutronCollected');
                this.oldNeutronPosition = {
                    x: neutron.x,
                    y: neutron.y,
                };
            }
        }, null, self);
    });


    this.socket.on('updateKills', function (player) {
        if (self.socket.id == player.playerId) {
            self.element.kills = player.kills;
            self.killScoreText.text = 'Kills: ' + player.kills;
            self.element.atomicNum++;

            self.element.upgrade();
            self.socket.emit('upgrade', self.element.atomicNum);
        }
    });
    this.socket.on('player-hit', function(player){
        if (self.socket.id == player.playerID){
            self.element.lastHurt = new Date();
            self.element.lastHurt = self.element.lastHurt.getTime();
        }
        console.log('time' + self.element.lastHurt)
    });
    function addPlayer(self, playerInfo) {
        //code for element class
        self.element = new Element(self, playerInfo.x, playerInfo.y, 45, playerInfo.playerId, "hydrogen");

        self.element.oldPosition = {
            x: self.element.x,
            y: self.element.y,
            rotation: self.element.rotation
        };
        self.element.body.enable = true;

        self.killScoreText = self.add.text(16, 40, 'Kills: ' + (0), { fontSize: '25px', fill: '#FF0000' });

        self.healthLabel = self.add.text(16, 10, "Health: 100", { fontSize: '25px', fill: '#FF0000' });


    }

    function addOtherPlayers(self, playerInfo) {
        if (playerInfo.atomicNumServer < 5) {
            const otherElement = new Element(self, playerInfo.x, playerInfo.y, 45, playerInfo.playerId, this.gameSettings.texture[playerInfo.atomicNumServer - 1]);
            otherElement.setTint(0x0000ff);
            self.otherElements.add(otherElement);
            otherElement.body.enable = true;
        }
        else {
            const otherElement = new Element(self, playerInfo.x, playerInfo.y, 45, playerInfo.playerId, this.gameSettings.texture[2]);
            otherElement.setTint(0x0000ff);
            self.otherElements.add(otherElement);
            otherElement.body.enable = true;
        }



    }

    //Setting the background to a gray-ish color
    this.cameras.main.backgroundColor.setTo(200, 200, 200);


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

    if (typeof this.element != "undefined") {
        this.element.movePlayer(this);
        this.healthLabel.text = "Health: " + this.element.hp.value;


        if ((this.input.activePointer.isDown || Phaser.Input.Keyboard.JustDown(this.spacebar)) && lastShot + 500 < time) {
            let bullet = this.element.shootBullet(this);

            // Tell the server we shot a bullet 
            this.socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bullet.angle, speed_x: bullet.speed_x, speed_y: bullet.speed_y, damage: bullet.damage })
            lastShot = time;
        }

        if (Math.random() < 0.5) this.element.x += 0.000000001;
        else this.element.x -= 0.000000001;

        if (typeof this.element.oldPosition != "undefined") {
            let x = this.element.x;
            let y = this.element.y;

            let r = this.element.rotation;
            if ((x !== this.element.oldPosition.x || y !== this.element.oldPosition.y || r !== this.element.oldPosition.rotation)) {
                this.socket.emit('playerMovement', { x: this.element.x, y: this.element.y, vx: this.element.body.velocity.x, vy: this.element.body.velocity.y, rotation: this.element.rotation });
                this.socket.emit('playerMovement', { x: this.element.x, y: this.element.y, vx: this.element.body.velocity.x, vy: this.element.body.velocity.y, rotation: this.element.rotation });
            }
        }

        this.element.oldPosition = {
            x: this.element.x,
            y: this.element.y,
            rotation: this.element.rotation,
        };

        if (time > lastHealed + 1000 && time > lastShot + 3000 && time > this.element.lastHurt + 10000) {
            console.log(time, this.element.lastHurt)
            this.element.hp.increment(3);
            this.socket.emit('player-heal', { id: this.element.playerId, health: this.element.hp.value });
            lastHealed = time;
        }
    }
}




























