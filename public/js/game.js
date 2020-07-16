/*TO DO:
FOR OFTEN USED VARIABLES REQUIRING INDEXING AND/OR PROCESSSING, CREATE A NEW VARIABLE TO STORE THAT VALUE
*/

//This class is used for defining global letiables that can be accessed by any class

//Dictionary of game settings
//fconst fs = require('fs');

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
    upgradePEN: 1,
    group1: [1, 3, 11, 19, 37, 55, 87],
    group2: [4, 12, 20, 38, 56, 88],
    group3: [5, 13, 31, 49, 81, 113],
    group4: [6, 14, 32, 50, 82, 114],
    group5: [7, 15, 33, 51, 83, 115],
    group6: [8, 16, 34, 52, 84, 116],
    group7: [9, 17, 35, 53, 85, 117],
    group8: [2, 10, 18, 36, 54, 86, 118],
    transitionmetals: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
        72, 73, 74, 75, 76, 77, 78, 79, 80,
        104, 105, 106, 107, 108, 109, 110, 111, 112],
    lanthanides: [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71],
    actinides: [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103]
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
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

//initializing some global vars
var lastShot = 0;
var lastHealed = 0;
var lastScoreUpdate = 0;

if (typeof localStorage.getItem("vOneLocalStorage") != undefined) {
    var username0 = localStorage.getItem("vOneLocalStorage");
}
else {
    var username0;
}
var email;
var currentHighScore;

let users;

var playerX;
var playerY;

var elementNumbers = JSON.parse(fs.readFileSync('elements.json', 'utf8'))

var lastScoreUpdate;

var isHit = false;


function preload() {
    this.load.image("hydrogenbullet", "./assets/images/hydrogenbullet.png");

    //CHANGE LINE BELOW, CURRENTLY TESTING
    this.load.image("heliumbullet", "./assets/images/group8Bullet.png");
    this.load.image("obstaclebullet", "./assets/images/obstacle.png");
    //this.load.image("heliumbullet", "./assets/images/group7Bullet.png");

    this.load.image("hydrogen", "./assets/images/hydrogen.png");
    this.load.image("helium", "./assets/images/helium.png");
    //need to change to lithium
    this.load.image("obstacle", "./assets/images/lithium.png");
    this.load.image("vrishabkrishna", "./assets/images/vrishabkrishna.png");


    this.load.image("proton", "./assets/images/proton.svg");
    this.load.image("electron", "./assets/images/electron.svg");
    this.load.image("neutron", "./assets/images/neutron.svg");
    this.load.image("bg", "./assets/images/dope.png");

    //Setting the maximum number of mouse pointers that can be used on the screen to one
    this.input.maxPointers = 1;
}

function create() {
    //console.log(elementNumbers);

    //accessing user information to get username
    $.ajax({
        type: 'GET',
        url: '/users',
        success: function (data) {
            users = data;
            if (typeof localStorage.getItem("vTwoLocalStorage") != null) {
                for (var i = 0; i < users.length; i++) {
                    if (users[i].email == localStorage.getItem("vTwoLocalStorage")) {
                        username0 = users[i].name;
                        email = users[i].email;
                        currentHighScore = users[i].highScore;

                    }
                }
            }
        },
        error: function (xhr) {
            console.log(xhr);
            console.log("BOB JOE");
        }
    });

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

    //creating PEN arrays
    this.proton_array = [];
    for (let i = 0; i < 15; i++) {
        var bb = this.physics.add.image(-1, -1, 'proton');
        bb.setScale(0.03);
        this.proton_array.push(bb);
    }

    this.electron_array = [];
    for (let i = 0; i < 15; i++) {
        var bb2 = this.physics.add.image(-1, -1, 'electron');
        bb2.setScale(0.03);
        this.electron_array.push(bb2);
    }

    this.neutron_array = [];
    for (let i = 0; i < 15; i++) {
        var bb3 = this.physics.add.image(-1, -1, 'neutron');
        bb3.setScale(0.03);
        this.neutron_array.push(bb3);
    }

    //creates instance of socket.io
    let self = this;
    this.socket = io();
    this.otherElements = this.physics.add.group();
    this.socket.on('currentPlayers', function (players) {
        //add time delay
        Object.keys(players).forEach((id) => {
            if (players[id].playerId == self.socket.id) {
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
        self.otherElements.getChildren().forEach((otherElement) => {
            console.log("player disconnected")
            if (playerId == otherElement.playerId) {
                otherElement.hp.destroy()
                otherElement.destroy();
                console.log("player destroyed")
            }
        });
    });

    //removes dead players from the screen
    this.socket.on('deleteDeadPlayers', function (playerId) {
        self.otherElements.getChildren().forEach((otherElement) => {
            console.log("player disconnected")
            if (playerId == otherElement.playerId) {
                otherElement.hp.destroy();
                otherElement.destroy();
                console.log("player destroyed");
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
                if (player.playerId == otherElement.playerId) {
                    otherElement.hp.set(player.health);
                }
            });
        }
        if (self.element.hp.value <= 0) {
            $.ajax({
                type: 'POST',
                url: '/logout',
                success: function () {
                    window.alert("You died!");
                    window.location.href = "index.html";
                },
                error: function () {
                    window.alert("System Error");
                    window.location.href = "index.html";
                }
            });
        }
    });

    // upgrades a player
    this.socket.on('playerUpgraded', function (playerInfo) {
        self.otherElements.getChildren().forEach((otherElement) => {
            if (playerInfo.playerId == otherElement.playerId) {
                otherElement.atomicNum = playerInfo.atomicNumServer;
                //NEED TO CHANGE AS WE GO ALONG
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
                //let angle = Phaser.Math.Angle.Between(self.element.x, self.element.y, self.input.activePointer.worldX, self.input.activePointer.worldY);
                self.element.bullet_array[i] = new Bullet(self, server_bullet_array[i].angle, server_bullet_array[i].x, server_bullet_array[i].y, gameSettings.texture[server_bullet_array[i].atomicNumber - 1]);
                //specific to group8 laser bullets
                if (gameSettings.group8.includes(server_bullet_array[i].atomicNumber)) {
                    self.element.bullet_array[i].rotation = server_bullet_array[i].rotAngle;
                }
            }
            else {

                //Otherwise, just update bullet locations
                self.element.bullet_array[i].enableBody(true, true);
                self.element.bullet_array[i].setTexture(gameSettings.texture[server_bullet_array[i].atomicNumber - 1] + "bullet");


                if (gameSettings.transitionmetals.includes(server_bullet_array[i].atomicNumber)) {
                    self.element.bullet_array[i].rotation += 0.015;
                }

                self.element.bullet_array[i].x = server_bullet_array[i].x;
                self.element.bullet_array[i].y = server_bullet_array[i].y;

                //let changex = self.element.x - server_bullet_array[i].x;
                //let changey = self.element.y - server_bullet_array[i].y;
                //let distance = Math.sqrt(changex * changex + changey * changey);
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


    //find way to destroy protons that were collected from the array
    //change overlap from self.proton to proton group

    this.socket.on('protonUpdate', function (server_proton_array) {

        for (let i = 0; i < server_proton_array.length; i++) {

            if (self.proton_array[i]) self.proton_array[i].destroy();

            self.proton_array[i] = self.physics.add.image(server_proton_array[i].x, server_proton_array[i].y, 'proton');
            self.proton_array[i].setScale(0.08);

            self.physics.add.overlap(self.element, self.proton_array[i], function () {

                if (server_proton_array[i].x != this.oldProtonPosition[i].x || server_proton_array[i].y != this.oldProtonPosition[i].y) {
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
                    this.socket.emit('scoreUpdate', idScore)
                }
            }, null, self);
        }
    });

    //repeat of protonUpdate for neutrons
    this.socket.on('neutronUpdate', function (server_neutron_array) {

        for (let i = 0; i < server_neutron_array.length; i++) {

            if (self.neutron_array[i]) self.neutron_array[i].destroy();

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
                    this.socket.emit('scoreUpdate', idScore)
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
            self.socket.emit('scoreUpdate', idScore);
        }
    });

    this.leaderboard = [];
    for (var i = 0; i < 5; i++) {
        this.leaderboard.push(self.add.text(0, 20 * i, ""));
    }
    this.socket.on('update-leaderboard', function (items) {
        //self.killScoreText = self.add.text(16, 40, 'Kills: ' + (0), { fontSize: '25px', fill: '#00FF00' });

        for (let i = 0; i < 5; i++) {
            if (i < items.length) {
                self.leaderboard[i].text = String(items[i][0]) + ': ' + String(items[i][2]);
            }
            else {
                self.leaderboard[i].text = "";
            }
        }
    });


    //RENAME TO SOMETHING LIKE SENDUSERNAMEINFO 
    this.socket.on('updateTheLeaderboard', function () {
        usernameInfo = {
            username: username0,
            id: self.socket.id
        }
        self.socket.emit('usernameInfo', usernameInfo);
    });

    //used for managing the lastHurt variable, player can only heal after not being damaged for some time
    this.socket.on('player-hit', function (healthInfo) {
        if (self.socket.id == healthInfo.id) {
            date_obj = new Date();
            self.element.lastHurt = date_obj.getTime();
            if (gameSettings.transitionmetals.includes(healthInfo.atomicNumber)) {
                isHit = true;
                self.element.lastHurtByTransition = date_obj.getTime();
                self.knockbackSpeedX = healthInfo.speedX;
                self.knockbackSpeedY = healthInfo.speedY;
                self.transitionBulletAngle = healthInfo.bulletAngle;
            }
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

        playerX = self.element.x;
        playerY = self.element.y;
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
    this.projectiles = this.add.group();

    //create leaderboard background image
    this.rect = new Phaser.Geom.Rectangle(900, 0, 300, 250);
    this.graphics = this.add.graphics({ fillStyle: { color: 0x000000 } });
    this.graphics.fillRectShape(this.rect);
    this.graphics.alpha = .3;
    this.leaderboardBg = this.graphics.generateTexture("leaderboardBg");

    this.rect2 = new Phaser.Geom.Rectangle(config.width - config.width / 10 - 50, config.height - config.height / 10 - 50, config.width / 10 + 10, config.height / 10 + 10);
    this.graphics2 = this.add.graphics({ fillStyle: { color: 0x000000 } });
    this.graphics2.fillRectShape(this.rect2);
    this.graphics2.alpha = .5
    this.minimapBg = this.graphics2.generateTexture("minimapBg");


    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.whiteSquare = new Phaser.Geom.Rectangle(config.width - config.width / 10 - 50, config.height - config.height / 10 - 50, 10, 10);
    this.dot = this.add.graphics({ fillStyle: { color: 0xffffff } });
    this.dot.fillRectShape(this.whiteSquare);

    this.score = 0;
    this.killScore = 15;

    //creates scorebars at bottom of screen
    this.protonBar = new CollectionBar(this, config.width / 2 - 150, config.height - 120, "proton", 0);
    this.protonBarText = this.add.text(config.width / 2 - 60, config.height - 118, 'Protons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' })
    this.electronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 80, "electron", 0);
    this.electronBarText = this.add.text(config.width / 2 - 60, config.height - 78, 'Electrons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });
    this.neutronBar = new CollectionBar(this, config.width / 2 - 150, config.height - 40, "neutron", 0);
    this.neutronBarText = this.add.text(config.width / 2 - 60, config.height - 38, 'Neutrons: 0/' + gameSettings.upgradePEN, { fontSize: '16px', fill: '#000000' });
    this.atoms = this.add.container(playerX, playerY);
    this.atoms.add(this.protonBarText);
    this.atoms.add(this.electronBarText);
    this.atoms.add(this.neutronBarText);
    //this.atoms.add(this.healthLabel);
    //this.atoms.add(this.scoreText);
    //this.atoms.add(this.protonBar);
    this.atoms.setScrollFactor(0);
    //this.atomBars = this.add.container(playerX, playerY);
    //this.atomBars.add(this.protonBar);

}


function update(time) {
    if (typeof this.element != "undefined") {
        this.cameras.main.startFollow(this.element);
        this.cameras.main.followOffset.set(0, 0);

        if (gameSettings.lanthanides.includes(this.element.atomicNum)) {
            this.cameras.main.setZoom(0.7);
        }
        else {
            this.cameras.main.setZoom(1);
        }
        //Phaser.Math.Clamp

        this.element.movePlayer(this, gameSettings.playerSpeed, isHit, this.knockbackSpeedX, this.knockbackSpeedY, this.transitionBulletAngle);
        if (isHit == true && time - this.element.lastHurtByTransition > 150) {
            isHit = false;
        }

        this.protonBar.move(this, this.cameras.main.scrollX + config.width / 2 - 150, this.cameras.main.scrollY + config.height - 80);
        this.electronBar.move(this, this.cameras.main.scrollX + config.width / 2 - 150, this.cameras.main.scrollY + config.height - 80);
        this.neutronBar.move(this, this.cameras.main.scrollX + config.width / 2 - 150, this.cameras.main.scrollY + config.height - 40);


        this.leaderboardBg.x = this.cameras.main.scrollX + 10;
        this.leaderboardBg.y = this.cameras.main.scrollY;


        for (let i = 0; i < 5; i++) {
            this.leaderboard[i].x = this.leaderboardBg.x + 925;
            this.leaderboard[i].y = this.leaderboardBg.y + 20 + 20 * i;
        }

        //this.minimapBg.move(this, this.cameras.main.scrollX + config.width - 150, this.cameras.main.scrollY + config.height - 80);
        this.minimapBg.x = this.cameras.main.scrollX;
        this.minimapBg.y = this.cameras.main.scrollY;

        this.dot.x = this.cameras.main.scrollX;
        this.dot.y = this.cameras.main.scrollY;

        this.healthLabel.text = "Health: " + this.element.hp.value;
        this.healthLabel.x = this.cameras.main.scrollX + 10;
        this.healthLabel.y = this.cameras.main.scrollY + 10;

        this.killScoreText.x = this.cameras.main.scrollX + 10;
        this.killScoreText.y = this.cameras.main.scrollY + 50;

        this.scoreText.x = this.cameras.main.scrollX + 10;
        this.scoreText.y = this.cameras.main.scrollY + 90;

        //change to only lanthanide group
        if (gameSettings.lanthanides.includes(this.element.atomicNum)) {
            this.minimapBg.x += 220;
            this.minimapBg.y += 150;
            this.dot.x += 220;
            this.dot.y += 150;
            this.leaderboardBg.x += 250;
            this.leaderboardBg.y -= 180;

            this.healthLabel.text = "Health: " + this.element.hp.value;
            this.healthLabel.x -= 260;
            this.healthLabel.y -= 180;

            this.killScoreText.x -= 260;
            this.killScoreText.y -= 180;

            this.scoreText.x -= 260;
            this.scoreText.y -= 180;

            for (let i = 0; i < 5; i++) {
                this.leaderboard[i].x += 250;
                this.leaderboard[i].y -= 180;
            }
        }

        this.dot.x += this.element.x / (3840 / (config.width / 10));
        this.dot.y += this.element.y / (2080 / (config.height / 10));

        if ((this.input.activePointer.isDown || Phaser.Input.Keyboard.JustDown(this.spacebar)) && (lastShot + 500 < time || (lastShot + 250 < time && this.element.atomicNum == 2))) {
            let bullet = this.element.shootBullet(this);

            let bulletAngle = Phaser.Math.Angle.Between(this.element.x, this.element.y, this.input.activePointer.worldX, this.input.activePointer.worldY)
            //let distance = Math.sqrt((bullet.x - this.element.x) * (bullet.x - this.element.x) + (bullet.y - this.element.y) * (bullet.y - this.element.y));

            if (gameSettings.group8.includes(this.element.atomicNum)) {
                //actinideBullet(bullet, this.element, this.socket, bulletAngle);
                //group3Bullet(bullet, this.element, this.socket, bulletAngle, bulletAngle);
                //group4Bullet(bullet, this.element, this.socket, bulletAngle);
                //group6Bullet(bullet, distance, this.element, this.socket, bulletAngle);
                //lanthanideBullet(bullet, this.element, this.socket, bulletAngle);
                //transitionMetalBullet(bullet, this.element, this.socket, bulletAngle);
                group8Bullet(bullet, this.element, this.socket, bulletAngle, bulletAngle);
            }
            else {
                this.socket.emit('shoot-bullet', { x: bullet.x, y: bullet.y, angle: bulletAngle, bulletSpeed: gameSettings.bulletSpeed, damage: bullet.damage, atomicNumber: this.element.atomicNum, rotAngle: 0 });
            }

            lastShot = time;
        }

        if (lastScoreUpdate + 5000 < time) {

            if (typeof email != "undefined") {
                if (currentHighScore < this.score) {
                    console.log(username0);
                    console.log(email);
                    console.log(currentHighScore);
                    const data = {
                        email: email,
                        score: this.score,
                    };
                    $.ajax({
                        type: 'POST',
                        url: '/submit-score',
                        data,
                        success: function (data) {
                        },
                        error: function (xhr) {
                        }
                    });
                    currentHighScore = this.score;
                }
            }
            lastScoreUpdate = time;
        }

        if (Math.random() < 0.5) this.element.x += 0.000000001;
        else this.element.x -= 0.000000001;

        if (typeof this.element.oldPosition != "undefined") {
            let x = this.element.x;
            let y = this.element.y;

            let r = this.element.rotation;
            if ((x !== this.element.oldPosition.x || y !== this.element.oldPosition.y || r !== this.element.oldPosition.rotation)) {
                this.socket.emit('playerMovement', { x: this.element.x, y: this.element.y, rotation: this.element.rotation });
            }
        }

        this.element.oldPosition = {
            x: this.element.x,
            y: this.element.y,
            rotation: this.element.rotation,
        };

        upDate = new Date();

        if (time > lastHealed + 1000 && time > lastShot + 3000 && upDate.getTime() > this.element.lastHurt + 3000) {
            this.element.hp.increment(3);
            this.socket.emit('player-heal', { id: this.element.playerId, health: this.element.hp.value });
            lastHealed = time;
        }

        if (upDate.getTime() > this.element.lastHurtByTransition + 300 && isHit) {
            isHit = false;
        }
    }
} 


/*
    //displays other players' movement on screen
    this.socket.on('playerMoved', function (playerInfo) {
        if (playerInfo.playerId == self.socket.id) {
            //goal --> get to playerInfo.x, y
            self.element.setPosition(playerInfo.x, playerInfo.y);

            self.element.hp.move(self, otherElement.x - 40, otherElement.y + 70);
        }
        self.otherElements.getChildren().forEach((otherElement) => {
            if (playerInfo.playerId == otherElement.playerId) {
                //update other player's locations
                otherElement.setRotation(playerInfo.rotation);
                otherElement.setPosition(playerInfo.x, playerInfo.y);

                //otherElement.setPosition(playerInfo.x, playerInfo.y);
                otherElement.hp.move(self, otherElement.x - 40, otherElement.y + 70);
            }
        });
    });
    */