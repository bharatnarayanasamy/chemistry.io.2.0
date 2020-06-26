//This class is used for defining global letiables that can be accessed by any class

//Dictionary of game settings
var gameSettings = {
    playerSpeed: 300,
    bulletSpeed: 350,
    maxPowerups: 14,
    maxObstacles: 2,
    powerUpVel: 50,
    obstacleVel: 0,
    ROTATION_SPEED_DEGREES: Phaser.Math.RadToDeg(2 * Math.PI), // 0.5 arc per sec, 2 sec per arc
    TOLERANCE: 0.04 * 1 * Math.PI,
    playerHealth: 100,
    texture: ["hydrogen", "helium", "obstacle", "vrishabkrishna"],
    upgradePEN: 5
}

//includes all the necessary phaser information
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

//used in update to make sure healing does not occur when shot/shooting
var lastShot = 0;
var lastHealed = 0;

//creates the game itself
var game = new Phaser.Game(config);
var element = null;

var proton_array = [];

for (let i = 0; i < 15; i++) {

    proton_array.push({
      x: -1,
      y: -1,
    });
    
}

var electron_array = [];

for (let i = 0; i < 15; i++) {

    electron_array.push({
      x: -1,
      y: -1,
    });
    
}

var neutron_array = [];

for (let i = 0; i < 15; i++) {

    neutron_array.push({
      x: -1,
      y: -1,
    });
    
}

function preload() {

    //Loading the images for the bullet types, players, proton, electron and neutrons
    this.load.image("hydrogenbullet", "./assets/images/hydrogenbullet.png");
    this.load.image("heliumbullet", "./assets/images/heliumbullet.png");
    this.load.image("obstaclebullet", "./assets/images/obstacle.png");

    this.load.image("hydrogen", "./assets/images/hydrogen.png");
    this.load.image("helium", "./assets/images/helium.png");
    this.load.image("obstacle", "./assets/images/lithium.png");
    this.load.image("vrishabkrishna", "./assets/images/vrishabkrishna.png");


    this.load.image("proton", "./assets/images/proton.svg");
    this.load.image("electron", "./assets/images/electron.svg");
    this.load.image("neutron", "./assets/images/neutron.svg");
    this.load.image("bg", "./assets/images/dope.png");

    //Setting the maximum number of mouse pointers that can be used on the screen to one
    this.input.maxPointers = 1;
}

// Built-in Phaser function that runs only once at the beginning of the game
function create() {

    //  Set the camera and physics bounds to be the size of 4x4 bg images
    this.cameras.main.setBounds(0, 0, 1920 * 2, 1080 * 2);
    this.physics.world.setBounds(0, 0, 1920 * 2, 1080 * 2);

    //  Mash 4 images together to create our background
    this.add.image(0, 0, 'bg').setOrigin(0);
    this.add.image(1920, 0, 'bg').setOrigin(0).setFlipX(true);
    this.add.image(0, 1080, 'bg').setOrigin(0).setFlipY(true);
    this.add.image(1920, 1080, 'bg').setOrigin(0).setFlipX(true).setFlipY(true);

    //Enabling collisions when an object hits the boundary
    this.physics.world.setBoundsCollision();
    
    //creating proton array
    this.proton_array = [];
    for (let i = 0; i < 15; i++) {
        var bb = this.physics.add.image(-1000, -1000, 'proton');
        bb.setScale(0.03);
        proton_array.push(bb);
    }

    this.electron_array = [];
    for (let i = 0; i < 15; i++) {   
        var bb2 = this.physics.add.image(-1000, -1000, 'electron');
        bb2.setScale(0.03);
        electron_array.push(bb2);
    }
    
    this.neutron_array = [];
    for (let i = 0; i < 15; i++) {
        var bb3 = this.physics.add.image(-1000, -1000, 'neutron');
        bb3.setScale(0.03);
        neutron_array.push(bb3);
    }

    //creates instance of socket.io
    let self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();
    this.otherElements = this.physics.add.group();
    this.otherPlayersHP = [];
    this.socket.on('currentPlayers', function (players) {
        //add time delay
        Object.keys(players).forEach((id) => {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            } else {
                addOtherPlayers(self, players[id]);
            }
        });
    });

    //adds new player to screen
    this.socket.on('newPlayer', function (playerInfo) {
        //add time delay
        addOtherPlayers(self, playerInfo);
    });

    //disconnects from the game
    this.socket.on('disconnect', function (playerId) {
        //add time delay  
        //destroying other elements
        self.otherElements.getChildren().forEach((otherElement) => {
            console.log("player disconnected")
            if (playerId === otherElement.playerId) {
                otherElement.hp.destroy()
                otherElement.destroy();
                console.log("player destroyed")
            }
        });
        for (let i = 0; i < self.leaderboard.length; i++) {
            console.log(self.leaderboard[i].text.substring(0, 20))
            console.log(playerId);
            if (self.leaderboard[i].text.substring(0, 20) == playerId) {
                console.log("beep bop test");
                self.leaderboard[i].text = '';
            }
        }
    });

    //removes dead players from the screen
    this.socket.on('deleteDeadPlayers', function (playerId) {
        self.otherElements.getChildren().forEach((otherElement) => {
            console.log("player disconnected")
            if (playerId === otherElement.playerId) {
                otherElement.hp.destroy();
                otherElement.destroy();
                console.log("player destroyed");
            }
        });
    });

    //displays other players' movement on screen
    this.socket.on('playerMoved', function (playerInfo) {
        //add time delay
        self.otherElements.getChildren().forEach((otherElement) => {
            if (playerInfo.playerId === otherElement.playerId) {
                //update other player's locations
                otherElement.body.setVelocity(0);
                otherElement.body.setVelocityX(playerInfo.vx);
                otherElement.body.setVelocityY(playerInfo.vy);
                otherElement.rotation = playerInfo.rotation;
                otherElement.body.setCollideWorldBounds(true);
                otherElement.hp.move(self, otherElement.x - 40, otherElement.y + 70);
            }
        });
    });

    //updates a player's health 
    this.socket.on('update-health', function (player) {
        if (player.playerId == self.socket.id) {
            self.element.hp.set(player.health);
        }
        else {
            self.otherElements.getChildren().forEach((otherElement) => {
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

    // upgrades a player
    this.socket.on('playerUpgraded', function (playerInfo) {
        self.otherElements.getChildren().forEach((otherElement) => {
            if (playerInfo.playerId == otherElement.playerId) {
                otherElement.atomicNum = playerInfo.atomicNumServer;
                if (playerInfo.atomicNumServer < 5) {
                    otherElement.setTexture(gameSettings.texture[otherElement.atomicNum - 1]);
                }
            }
        });

    });

    // Listen for bullet update events 
    this.socket.on('bullets-update', function (server_bullet_array) {
        // If there's client and server bullet arrays have mismatch, fix mismatch
        for (let i = 0; i < server_bullet_array.length; i++) {
            if (self.element.bullet_array[i] == undefined) {
                let angle = Phaser.Math.Angle.Between(self.element.x, self.element.y, self.input.activePointer.worldX, self.input.activePointer.worldY);
                self.element.bullet_array[i] = new Bullet(self, angle, server_bullet_array[i].x, server_bullet_array[i].y, gameSettings.texture[server_bullet_array[i].atomicNumber - 1]);
            }
            else {
                //Otherwise, just update bullet locations
                self.element.bullet_array[i].enableBody(true, true);
                self.element.bullet_array[i].setTexture(gameSettings.texture[server_bullet_array[i].atomicNumber - 1] + "bullet");

                self.element.bullet_array[i].x = server_bullet_array[i].x;
                self.element.bullet_array[i].y = server_bullet_array[i].y;
            }
        }
        // Otherwise if there's too many, delete the extra bullets
        for (let i = server_bullet_array.length; i < self.element.bullet_array.length; i++) {
            self.element.bullet_array[i].destroy();
            self.element.bullet_array.splice(i, 1);
            i--;
        }
    });

    //set number of proton/electron/neutron to zero
    this.numProtons = 0;
    this.numElectrons = 0;
    this.numNeutrons = 0;

    //initialize proton position objects
    this.oldProtonPosition = [];
    for (let i = 0; i < 15; i++) {
        this.oldProtonPosition.push({
            x: -1000,
            y: -1000
        }); 
    }

    this.oldElectronPosition = [];
    for (let i = 0; i < 15; i++) {
        this.oldElectronPosition.push({
            x: -1000,
            y: -1000
        }); 
    }


    this.oldNeutronPosition = [];
    for (let i = 0; i < 15; i++) {
        this.oldNeutronPosition.push({
            x: -1000,
            y: -1000
        }); 
    }

    this.score = 0;
    this.killScore = 15;
    //creates scorebars at bottom of screen
    this.protonBar = new CollectionBar(this, config.width / 2 - 150, config.height - 120, "proton", 0);
    this.protonBarText = this.add.text(config.width / 2 - 60, config.height - 118, 'Protons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });
    this.electronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 80, "electron", 0);
    this.electronBarText = this.add.text(config.width / 2 - 60, config.height - 78, 'Electrons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });
    this.neutronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 40, "neutron", 0);
    this.neutronBarText = this.add.text(config.width / 2 - 60, config.height - 38, 'Neutrons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });



    //create proton group/array?
    //find way to destroy protons that were collected from the array
    //change overlap from self.proton to proton group

    this.socket.on('protonUpdate', function(server_proton_array) {

        for (let i = 0; i < server_proton_array.length; i++) {

            if (self.proton_array[i]) self.proton_array[i].destroy();

            //console.log("X: " + server_proton_array[i].x + " " + "Y: " + server_proton_array[i].y);
            self.proton_array[i] = self.physics.add.image(server_proton_array[i].x, server_proton_array[i].y, 'proton');
            self.proton_array[i].setScale(0.08);

            

            self.physics.add.overlap(self.element, self.proton_array[i], function () {
                // console.log("entered proton overlap");
                // console.log("overlap gang!");
                // console.log("i" + i);
                // console.log(server_proton_array[i].x);
                // console.log(this.oldProtonPosition[i].x);
                // console.log(this.oldProtonPosition[i]);



                if (server_proton_array[i].x != this.oldProtonPosition[i].x || server_proton_array[i].y != this.oldProtonPosition[i].y) {
                    console.log(this.killScore);
                    this.score += this.killScore / (gameSettings.upgradePEN * 3);
                    this.scoreText.text = 'Score: ' + this.score;

                    if (this.numProtons < gameSettings.upgradePEN) {
                        this.numProtons++;
                        this.protonBar.increment(100 / gameSettings.upgradePEN);
                        this.protonBarText.text = 'Protons: ' + this.numProtons + '/' + gameSettings.upgradePEN;
                    }
                    //level up if player has collected sufficient number of protons, neutrons, and electrons (PENs)
                    if (this.numNeutrons == gameSettings.upgradePEN && this.numProtons == gameSettings.upgradePEN && this.numElectrons == gameSettings.upgradePEN) {
                        self.element.atomicNum++;
                        this.numNeutrons = 0;
                        this.numProtons = 0;
                        this.numElectrons = 0;

                        this.protonBar.increment(-100);
                        this.protonBarText.text = "Protons: 0/" + gameSettings.upgradePEN;
                        this.electronBar.increment(-100);
                        this.electronBarText.text = "Electrons: 0/" + gameSettings.upgradePEN;
                        this.neutronBar.increment(-100);
                        this.neutronBarText.text = "Neutrons: 0/" + gameSettings.upgradePEN;

                        self.element.upgrade();
                        self.socket.emit('upgrade', self.element.atomicNum);
                    }

                    this.socket.emit('protonCollected', i);
                    this.oldProtonPosition[i] = {
                        x: server_proton_array[i].x,
                        y: server_proton_array[i].y,
                    };
                    var idScore = {
                        id: self.socket.id,
                        sc: self.score
                    };
                    this.socket.emit('scoreUpdate', idScore)
                }
            }, null, self);
        }
    }); 
     

    //repeat of protonUpdate for electrons
    this.socket.on('electronUpdate', function (server_electron_array) {
        
        
        for (let i = 0; i < server_electron_array.length; i++) {

            if (self.electron_array[i]) self.electron_array[i].destroy();

            //console.log("X: " + server_electron_array[i].x + " " + "Y: " + server_electron_array[i].y);
            self.electron_array[i] = self.physics.add.image(server_electron_array[i].x, server_electron_array[i].y, 'electron');
            self.electron_array[i].setScale(0.04);

            self.physics.add.overlap(self.element, self.electron_array[i], function () {
                
                if (server_electron_array[i].x != this.oldElectronPosition[i].x || server_electron_array[i].y != this.oldElectronPosition[i].y) {
                    this.score += this.killScore / (gameSettings.upgradePEN * 3);
                    this.scoreText.text = 'Score: ' + this.score;
                    if (this.numElectrons < gameSettings.upgradePEN) {
                        this.numElectrons++;
                        this.electronBar.increment(100 / gameSettings.upgradePEN);
                        this.electronBarText.text = 'Electrons: ' + this.numElectrons + '/' + gameSettings.upgradePEN;
                    }
                    //level up if player has collected sufficient number of protons, neutrons, and electrons (PENs)
                    if (this.numNeutrons == gameSettings.upgradePEN && this.numProtons == gameSettings.upgradePEN && this.numElectrons == gameSettings.upgradePEN) {
                        self.element.atomicNum++;
                        this.numNeutrons = 0;
                        this.numProtons = 0;
                        this.numElectrons = 0;

                        this.protonBar.increment(-100);
                        this.protonBarText.text = "Protons: 0/" + gameSettings.upgradePEN;
                        this.electronBar.increment(-100);
                        this.electronBarText.text = "Electrons: 0/" + gameSettings.upgradePEN;
                        this.neutronBar.increment(-100);
                        this.neutronBarText.text = "Neutrons: 0/" + gameSettings.upgradePEN;

                        self.element.upgrade();
                        self.socket.emit('upgrade', self.element.atomicNum);
                    }

                    this.socket.emit('electronCollected', i);
                    this.oldElectronPosition[i] = {
                        x: server_electron_array[i].x,
                        y: server_electron_array[i].y,
                    };
                    idScore = {
                        id: self.socket.id,
                        sc: self.score
                    }
                    this.socket.emit('scoreUpdate',idScore)
                }
            }, null, self);
        }

        
      
    });

    //repeat of protonUpdate for neutrons
    this.socket.on('neutronUpdate', function (server_neutron_array) {

        for (let i = 0; i < server_neutron_array.length; i++) {

            if (self.neutron_array[i]) self.neutron_array[i].destroy();

            //console.log("X: " + server_proton_array[i].x + " " + "Y: " + server_proton_array[i].y);
            self.neutron_array[i] = self.physics.add.image(server_neutron_array[i].x, server_neutron_array[i].y, 'neutron');
            self.neutron_array[i].setScale(0.08);

            

            self.physics.add.overlap(self.element, self.neutron_array[i], function () {
        

                if (server_neutron_array[i].x != this.oldNeutronPosition[i].x || server_neutron_array[i].y != this.oldNeutronPosition[i].y) {
                    this.score += this.killScore / (gameSettings.upgradePEN * 3);
                    this.scoreText.text = 'Score: ' + this.score;

                    if (this.numNeutrons < gameSettings.upgradePEN) {
                        this.numNeutrons++;
                        this.neutronBar.increment(100 / gameSettings.upgradePEN);
                        this.neutronBarText.text = 'Neutrons: ' + this.numNeutrons + '/' + gameSettings.upgradePEN;
                    }
                    //level up if player has collected sufficient number of protons, neutrons, and electrons (PENs)
                    if (this.numNeutrons == gameSettings.upgradePEN && this.numProtons == gameSettings.upgradePEN && this.numElectrons == gameSettings.upgradePEN) {
                        self.element.atomicNum++;
                        this.numNeutrons = 0;
                        this.numProtons = 0;
                        this.numElectrons = 0;

                        this.protonBar.increment(-100);
                        this.protonBarText.text = "Protons: 0/" + gameSettings.upgradePEN;
                        this.electronBar.increment(-100);
                        this.electronBarText.text = "Electrons: 0/" + gameSettings.upgradePEN;
                        this.neutronBar.increment(-100);
                        this.neutronBarText.text = "Neutrons: 0/" + gameSettings.upgradePEN;

                        self.element.upgrade();
                        self.socket.emit('upgrade', self.element.atomicNum);
                    }

                    this.socket.emit('neutronCollected', i);
                    this.oldNeutronPosition[i] = {
                        x: server_neutron_array[i].x,
                        y: server_neutron_array[i].y,
                    };

                    idScore = {
                        id: self.socket.id,
                        sc: self.score
                    }
                    this.socket.emit('scoreUpdate',idScore)
                }
            }, null, self);
        }
    });


        

    //Updates the kill count once this player kills someone  
    this.socket.on('updateKills', function (player) {
        if (self.socket.id == player.playerId) {
            self.element.kills = player.kills;
            self.killScoreText.text = 'Kills: ' + player.kills;

            self.score += self.killScore;
            self.scoreText.text = 'Score: ' + self.score;

            self.element.atomicNum++;

            self.element.upgrade();
            self.socket.emit('upgrade', self.element.atomicNum);

            idScore = {
                id: self.socket.id,
                sc: self.score
            }
            this.socket.emit('scoreUpdate',idScore)
        }
    });

    this.leaderboard = [self.add.text(200, 20,''), self.add.text(200,40,''), self.add.text(200,60,''), self.add.text(200,80,''), self.add.text(200,100,'')];
    this.socket.on('update-leaderboard', function (items) {
        //self.killScoreText = self.add.text(16, 40, 'Kills: ' + (0), { fontSize: '25px', fill: '#00FF00' });
        
        for (let i  = 0; i < Math.min(5, items.length); i++) {            
            self.leaderboard[i].text = String(items[i][0]) + ': ' + String(items[i][1]);
            //if (self.leaderboard[i].text[:20] )
        }
    });

    //used for managing the lastHurt variable, player can only heal after not being damaged for some time
    this.socket.on('player-hit', function (player) {
        if (self.socket.id == player.id) {
            date_obj = new Date();
            self.element.lastHurt = date_obj.getTime()
        }
    });

    //add this player onto the screen
    function addPlayer(self, playerInfo) {
        self.element = new Element(self, playerInfo.x, playerInfo.y, 45, playerInfo.playerId, "hydrogen");
        self.element.oldPosition = {
            x: self.element.x,
            y: self.element.y,
            rotation: self.element.rotation
        };
        self.element.body.enable = true;
        self.killScoreText = self.add.text(16, 40, 'Kills: ' + (0), { fontSize: '25px', fill: '#00FF00' });
        self.healthLabel = self.add.text(16, 10, "Health: 100", { fontSize: '25px', fill: '#00FF00' });

        //create score text on top left
        self.scoreText = self.add.text(16, 70, 'Score: ' + (0), { fontSize: '25px', fill: '#00FF00' });

    }

    //add other players onto the screen
    function addOtherPlayers(self, playerInfo) {
        if (playerInfo.atomicNumServer < 5) {
            const otherElement = new Element(self, playerInfo.x, playerInfo.y, 45, playerInfo.playerId, this.gameSettings.texture[playerInfo.atomicNumServer - 1]);
            self.otherElements.add(otherElement);
            otherElement.body.enable = true;
        }
        else {
            const otherElement = new Element(self, playerInfo.x, playerInfo.y, 45, playerInfo.playerId, this.gameSettings.texture[this.gameSettings.texture.length - 1]);
            //otherElement.setTint(0x0000ff);
            self.otherElements.add(otherElement);
            otherElement.body.enable = true;
        }


    }
    //Create group to hold all our projectiles, aka the bullets
    this.projectiles = this.add.group();

    this.rect = new Phaser.Geom.Rectangle(900, 0, 300, 250);
    this.graphics = this.add.graphics({ fillStyle: { color: 0x000000 } });
    this.graphics.fillRectShape(this.rect);
    this.graphics.alpha = .3;
    this.leaderboardBg = this.graphics.generateTexture("leaderboardBg");

    //used too collect information on keys that were pressed - important for moving the player  
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.cursors = this.input.keyboard.createCursorKeys();
    //collecting information on space bar
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

}


function update(time) {
    if (typeof this.element != "undefined") {

        this.cameras.main.startFollow(this.element);
        this.cameras.main.followOffset.set(10, 0);
        this.element.movePlayer(this);
    
        //try to test this stuff with   
        this.protonBar.move(this, this.cameras.main.scrollX + config.width / 2 - 150, this.cameras.main.scrollY + config.height - 120);
        this.protonBarText.x = this.protonBar.x + 90;
        this.protonBarText.y = this.protonBar.y + 2;
        this.electronBar.move(this, this.cameras.main.scrollX + config.width / 2 - 150, this.cameras.main.scrollY + config.height - 80);
        this.electronBarText.x = this.electronBar.x + 85;
        this.electronBarText.y = this.electronBar.y + 2;
        this.neutronBar.move(this, this.cameras.main.scrollX + config.width / 2 - 150, this.cameras.main.scrollY + config.height - 40);
        this.neutronBarText.x = this.neutronBar.x + 90;
        this.neutronBarText.y = this.neutronBar.y + 2;

        this.leaderboardBg.x = this.cameras.main.scrollX + 10;
        this.leaderboardBg.y = this.cameras.main.scrollY;

        for (let i  = 0; i < Math.min(5, this.otherElements.getChildren().length + 1); i++) {
            this.leaderboard[i].x = this.leaderboardBg.x + 925;
            this.leaderboard[i].y = this.leaderboardBg.y + 20 + 20 * i;
        }

        this.healthLabel.text = "Health: " + this.element.hp.value;
        this.healthLabel.x = this.cameras.main.scrollX + 10;
        this.healthLabel.y = this.cameras.main.scrollY + 10;

        this.killScoreText.x = this.cameras.main.scrollX + 10;
        this.killScoreText.y = this.cameras.main.scrollY + 50;

        this.scoreText.x = this.cameras.main.scrollX + 10;
        this.scoreText.y = this.cameras.main.scrollY + 90;

        if ((this.input.activePointer.isDown || Phaser.Input.Keyboard.JustDown(this.spacebar)) && lastShot + 500 < time) {
            let bullet = this.element.shootBullet(this);
            console.log("Bullet Shot!")
            // Tell the server we shot a bullet 

            bullet.changeProperty(this.element.atomicNum);
            let distance = Math.sqrt((bullet.x - this.element.x) * (bullet.x - this.element.x) + (bullet.y - this.element.y) * (bullet.y - this.element.y));

            if (this.element.atomicNum > 2) {
                doubleBullet(bullet, distance, this.element, this.socket);
            }
            else {
                this.socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bullet.angle, speed_x: bullet.speed_x, speed_y: bullet.speed_y, damage: bullet.damage, atomicNumber: this.element.atomicNum })
            }
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

        upDate = new Date()

        if (time > lastHealed + 1000 && time > lastShot + 3000 && upDate.getTime() > this.element.lastHurt + 3000) {
            this.element.hp.increment(3);
            this.socket.emit('player-heal', { id: this.element.playerId, health: this.element.hp.value });
            lastHealed = time;
        }
    }
}




function doubleBullet(bullet, distance, element0, socket0) {
    this.element = element0;

    if (bullet.x > this.element.x && bullet.y > this.element.y) {
        let tempangle = Math.atan((bullet.x - this.element.x) / (bullet.y - this.element.y));
        let tempangle1 = tempangle + 0.2;
        let tempangle2 = tempangle - 0.2;

        let x1 = Math.sin(tempangle1) * distance;
        let x2 = Math.sin(tempangle2) * distance;
        let y1 = Math.cos(tempangle1) * distance;
        let y2 = Math.cos(tempangle2) * distance;

        socket0.emit('shoot-bullet', { x: this.element.x + x1, y: this.element.y + y1, y1: bullet.angle, speed_x: bullet.speed_x, speed_y: bullet.speed_y, damage: bullet.damage, atomicNumber: this.element.atomicNum });
        socket0.emit('shoot-bullet', { x: this.element.x + x2, y: this.element.y + y2, y2: bullet.angle, speed_x: bullet.speed_x, speed_y: bullet.speed_y, damage: bullet.damage, atomicNumber: this.element.atomicNum });
    }
    else if (bullet.x > this.element.x && this.element.y > bullet.y) {
        tempangle = Math.atan((this.element.y - bullet.y) / (bullet.x - this.element.x));
        tempangle1 = tempangle + 0.2;
        tempangle2 = tempangle - 0.2;

        x1 = Math.cos(tempangle1) * distance;
        x2 = Math.cos(tempangle2) * distance;
        y1 = Math.sin(tempangle1) * distance;
        y2 = Math.sin(tempangle2) * distance;

        socket0.emit('shoot-bullet', { x: this.element.x + x1, y: this.element.y - y1, y1: bullet.angle, speed_x: bullet.speed_x, speed_y: bullet.speed_y, damage: bullet.damage, atomicNumber: this.element.atomicNum });
        socket0.emit('shoot-bullet', { x: this.element.x + x2, y: this.element.y - y2, y2: bullet.angle, speed_x: bullet.speed_x, speed_y: bullet.speed_y, damage: bullet.damage, atomicNumber: this.element.atomicNum });

    }
    else if (this.element.x > bullet.x && bullet.y > this.element.y) {
        tempangle = Math.atan((this.element.x - bullet.x) / (bullet.y - this.element.y));
        tempangle1 = tempangle + 0.2;
        tempangle2 = tempangle - 0.2;

        x1 = Math.sin(tempangle1) * distance;
        x2 = Math.sin(tempangle2) * distance;
        y1 = Math.cos(tempangle1) * distance;
        y2 = Math.cos(tempangle2) * distance;

        socket0.emit('shoot-bullet', { x: this.element.x - x1, y: this.element.y + y1, y1: bullet.angle, speed_x: bullet.speed_x, speed_y: bullet.speed_y, damage: bullet.damage, atomicNumber: this.element.atomicNum });
        socket0.emit('shoot-bullet', { x: this.element.x - x2, y: this.element.y + y2, y2: bullet.angle, speed_x: bullet.speed_x, speed_y: bullet.speed_y, damage: bullet.damage, atomicNumber: this.element.atomicNum });
    }
    else if (this.element.x > bullet.x && this.element.y > bullet.y) {
        tempangle = Math.atan((this.element.y - bullet.y) / (this.element.x - bullet.x));
        tempangle1 = tempangle + 0.2;
        tempangle2 = tempangle - 0.2;

        x1 = Math.cos(tempangle1) * distance;
        x2 = Math.cos(tempangle2) * distance;
        y1 = Math.sin(tempangle1) * distance;
        y2 = Math.sin(tempangle2) * distance;

        socket0.emit('shoot-bullet', { x: this.element.x - x1, y: this.element.y - y1, y1: bullet.angle, speed_x: bullet.speed_x, speed_y: bullet.speed_y, damage: bullet.damage, atomicNumber: this.element.atomicNum });
        socket0.emit('shoot-bullet', { x: this.element.x - x2, y: this.element.y - y2, y2: bullet.angle, speed_x: bullet.speed_x, speed_y: bullet.speed_y, damage: bullet.damage, atomicNumber: this.element.atomicNum });
    }
}