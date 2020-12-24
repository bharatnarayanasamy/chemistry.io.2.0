/*TO DO:
FOR OFTEN USED VARIABLES REQUIRING INDEXING AND/OR PROCESSSING, CREATE A NEW VARIABLE TO STORE THAT VALUE
*/

//This class is used for defining global letiables that can be accessed by any class

//Dictionary of game settings



var gameSettings = {
    playerSpeed: 300,
    bulletSpeed: 500,
    speedScale: 6,
    maxPowerups: 14,
    maxObstacles: 2,
    powerUpVel: 50,
    playerRadius: 50,
    obstacleVel: 0,
    playerHealth: 100,
    ROTATION_SPEED_DEGREES: Phaser.Math.RadToDeg(2 * Math.PI), // 0.5 arc per sec, 2 sec per arc
    TOLERANCE: 0.04 * 1 * Math.PI,
    //texture: ["hydrogen", "helium", "lithium", "vrishabkrishna"],
    texture: ["hydrogen", "helium", "lithium", "beryllium", "boron", "carbon", "nitrogen", "oxygen", "fluorine"],
    texLen: 9,
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
    actinides: [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103],
    mapWidth: 3840,
    mapHeight: 2160
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
var c = 0;

//initializing some global vars
var lastShot = 0;
var lastHealed = 0;
var lastScoreUpdate = 0;
var groupCreated = true;
var isOverlappingOther = false;
var currentSpeed = 0;
var iter;
//var speedX = 0, speedY = 0;

var count = 0;

if (typeof localStorage.getItem("username") != undefined) {
    var username0 = localStorage.getItem("username");
}
else {
    var username0;
}
var email = localStorage.getItem("email");
var currentHighScore;
var bestKills;

var bestElement;

let users;

var playerX;
var playerY;
var gameWidth = 3840;
var gameHeight = 2160

var hasDied = false;

var lastScoreUpdate;

var isHit = false;
var isMoving = false;

var texLen = gameSettings.texture.length;

var movementCommands = [];
var messageIndex = 0;

var elements = JSON.parse(localStorage.getItem("elements"));
let s = 0;
let z = 0;

Math.lerp = function (value1, value2, amount) {
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return value1 + (value2 - value1) * amount;
};

function preload() {

    //loading in element images and their bullet images

    for (let i = 1; i < 10; i++) { //temporary
        var imageName = elements[i].toLowerCase();
        this.load.image(imageName, "./assets/images/elements/" + imageName + ".png")
        this.load.image(imageName + "bullet", "./assets/images/bullets/" + imageName + "bullet" + ".png")
    }

    //this.load.image("vrishabkrishna", "./assets/images/old_images/vrishabkrishna.png");

    this.load.image("proton", "./assets/images/proton.png");
    this.load.image("electron", "./assets/images/electron.png");
    this.load.image("neutron", "./assets/images/neutron.png");
    this.load.image("bg", "./assets/images/background.png");

    this.load.spritesheet("explosion", "assets/spritesheets/explosion.png", {
        frameWidth: 16,
        frameHeight: 16
    });

    //Setting the maximum number of mouse pointers that can be used on the screen to one
    this.input.maxPointers = 1;
}

function create() {
    //accessing user information to get username
    if (typeof email != "object") {
        const data = { "email": localStorage.getItem("email") };
        $.ajax({
            type: 'GET',
            url: '/get-user',
            data,
            success: function (data) {
                data = data[0];
                username0 = data.name;
                currentHighScore = data.highScore;
                email = data.email;
                bestKills = data.kills;
                bestElement = data.bestElement;
            },
            error: function (xhr) {
            }
        });
    }

    //  Set the camera and physics bounds to be the size of 4x4 bg images
    this.cameras.main.setBounds(0, 0, 1920 * 2, 1080 * 2);
    this.physics.world.setBounds(0, 0, 1920 * 2, 1080 * 2);

    //  Mash 4 images together to create our background
    this.add.image(0, 0, 'bg').setOrigin(0);
    this.add.image(gameWidth / 2, 0, 'bg').setOrigin(0).setFlipX(true);
    this.add.image(0, gameHeight / 2, 'bg').setOrigin(0).setFlipY(true);
    this.add.image(gameWidth / 2, gameHeight / 2, 'bg').setOrigin(0).setFlipX(true).setFlipY(true);

    var g2 = this.add.grid(0, 0, 2 * gameWidth, 2 * gameHeight, 20, 20, 0xffffff, 1, 0xf8f8f8);

    //Enabling collisions when an object hits the boundary
    //this.physics.world.setBoundsCollision();

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

    this.anims.create({
        key: "explode",
        frames: this.anims.generateFrameNumbers("explosion"),
        frameRate: 20,
        repeat: 0,
        hideOnComplete: true
    });

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
            //console.log(player.health);
            //console.log("iQ- fuck off");
            self.element.hp.set(player.health);
        }
        else {
            //console.log("iQGGG");
            //console.log(player.health);
            self.otherElements.getChildren().forEach((otherElement) => {
                if (player.playerId == otherElement.playerId) {
                    otherElement.hp.set(player.health);
                }
            });
        }
        if (self.element.hp.value <= 0) {
            if (!hasDied) {
                $.ajax({
                    type: 'POST',
                    url: '/logout',
                    success: function () {
                        window.alert("You died!");
                        hasDied = true;
                        window.location.href = "index.html";
                    },
                    error: function () {
                        window.alert("System Error");
                        window.location.href = "index.html";
                    }
                });
            }
        }
    });

    // upgrades a player
    this.socket.on('playerUpgraded', function (playerInfo) {
        self.otherElements.getChildren().forEach((otherElement) => {
            if (playerInfo.playerId == otherElement.playerId) {
                otherElement.atomicNum = playerInfo.atomicNumServer;
                //NEED TO CHANGE AS WE GO ALONG
                if (playerInfo.atomicNumServer < texLen + 1) {
                    otherElement.setTexture(gameSettings.texture[otherElement.atomicNum - 1]);
                }
            }
        });

    });

    // Listen for bullet update events 
    this.socket.on('bullets-update', function (server_bullet_array_all) {


        // If there's client and server bullet arrays have mismatch, fix mismatch
        //console.log(server_bullet_array);
        let test = server_bullet_array_all.delete_set;
        let new_bullet_array = server_bullet_array_all.new_bullet_array;
        let delete_set = new Set(test);

        //Deleting out own bullets from the array
        for (let i = new_bullet_array.length - 1; i >= 0; i--) {
            console.log(new_bullet_array[i].x);

            if (new_bullet_array[i].owner_id == self.socket.id) {
                console.log("own bullet deleted!");
                new_bullet_array.splice(i, 1);
            }

        }


        //Adding all new bullest to the array
        for (let i = 0; i < new_bullet_array.length; i++) {

            let bullet = new Bullet(self, new_bullet_array[i].angle, new_bullet_array[i].x, new_bullet_array[i].y, gameSettings.texture[new_bullet_array[i].atomicNumber - 1]);
            bullet.id = new_bullet_array[i].id;
            bullet.owner_id = new_bullet_array[i].owner_id;


            if (typeof new_bullet_array[i].acc != "undefined") {
                bullet.acc = new_bullet_array[i].acc;
                bullet.increment = 1;
            }

            bullet.setTexture(gameSettings.texture[new_bullet_array[i].atomicNumber - 1] + "bullet");


            self.element.bullet_array.push(bullet);
            self.element.bullet_array[self.element.bullet_array.length - 1].setVisible(true);

            //self.element.bullet_array.push(bullet);
        }



        for (let i = self.element.bullet_array.length - 1; i >= 0; i--) {

            if (delete_set.has(self.element.bullet_array[i].id)) {
                console.log("ID FOUND!!!");
                self.element.bullet_array[i].destroy();
                self.element.bullet_array.splice(i, 1);
            }

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
            self.proton_array[i].setScale(0.15);

            self.physics.add.overlap(self.element, self.proton_array[i], function () {

                if (server_proton_array[i].x != this.oldProtonPosition[i].x || server_proton_array[i].y != this.oldProtonPosition[i].y) {
                    this.score += this.killScore / (gameSettings.upgradePEN * 3);
                    this.scoreText.text = 'Score: ' + this.score;

                    if (this.numProtons < gameSettings.upgradePEN) {
                        this.numProtons++;
                        this.protonBar.increment(this, 100 / gameSettings.upgradePEN, "proton");
                        this.protonBarText.text = 'Protons: ' + this.numProtons + '/' + gameSettings.upgradePEN;

                    }
                    //level up if player has collected sufficient number of protons, neutrons, and electrons (PENs)
                    if (this.numNeutrons == gameSettings.upgradePEN && this.numProtons == gameSettings.upgradePEN && this.numElectrons == gameSettings.upgradePEN) {
                        self.element.atomicNum++;
                        this.numNeutrons = 0;
                        this.numProtons = 0;
                        this.numElectrons = 0;
                        this.protonBar.increment(this, -100, "proton");
                        this.protonBarText.text = "Protons: 0/" + gameSettings.upgradePEN;
                        this.electronBar.increment(this, -100, "electron");
                        this.electronBarText.text = "Electrons: 0/" + gameSettings.upgradePEN;
                        this.neutronBar.increment(this, -100, "neutron");
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
            self.electron_array[i].setScale(0.15);

            self.physics.add.overlap(self.element, self.electron_array[i], function () {

                if (server_electron_array[i].x != this.oldElectronPosition[i].x || server_electron_array[i].y != this.oldElectronPosition[i].y) {
                    this.score += this.killScore / (gameSettings.upgradePEN * 3);
                    this.scoreText.text = 'Score: ' + this.score;
                    if (this.numElectrons < gameSettings.upgradePEN) {
                        this.numElectrons++;
                        this.electronBar.increment(this, 100 / gameSettings.upgradePEN, "electron");
                        this.electronBarText.text = 'Electrons: ' + this.numElectrons + '/' + gameSettings.upgradePEN;
                    }
                    //level up if player has collected sufficient number of protons, neutrons, and electrons (PENs)
                    if (this.numNeutrons == gameSettings.upgradePEN && this.numProtons == gameSettings.upgradePEN && this.numElectrons == gameSettings.upgradePEN) {
                        self.element.atomicNum++;
                        this.numNeutrons = 0;
                        this.numProtons = 0;
                        this.numElectrons = 0;

                        this.protonBar.increment(this, -100, "proton");
                        this.protonBarText.text = "Protons: 0/" + gameSettings.upgradePEN;
                        this.electronBar.increment(this, -100, "electron");
                        this.electronBarText.text = "Electrons: 0/" + gameSettings.upgradePEN;
                        this.neutronBar.increment(this, -100, "neutron");
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
            self.neutron_array[i].setScale(0.15);

            self.physics.add.overlap(self.element, self.neutron_array[i], function () {

                if (server_neutron_array[i].x != this.oldNeutronPosition[i].x || server_neutron_array[i].y != this.oldNeutronPosition[i].y) {
                    this.score += this.killScore / (gameSettings.upgradePEN * 3);
                    this.scoreText.text = 'Score: ' + this.score;

                    if (this.numNeutrons < gameSettings.upgradePEN) {
                        this.numNeutrons++;
                        this.neutronBar.increment(this, 100 / gameSettings.upgradePEN, "neutron");
                        this.neutronBarText.text = 'Neutrons: ' + this.numNeutrons + '/' + gameSettings.upgradePEN;
                    }
                    //level up if player has collected sufficient number of protons, neutrons, and electrons (PENs)
                    if (this.numNeutrons == gameSettings.upgradePEN && this.numProtons == gameSettings.upgradePEN && this.numElectrons == gameSettings.upgradePEN) {
                        self.element.atomicNum++;
                        this.numNeutrons = 0;
                        this.numProtons = 0;
                        this.numElectrons = 0;

                        this.protonBar.increment(this, -100, "proton");
                        this.protonBarText.text = "Protons: 0/" + gameSettings.upgradePEN;
                        this.electronBar.increment(this, -100, "electron");
                        this.electronBarText.text = "Electrons: 0/" + gameSettings.upgradePEN;
                        this.neutronBar.increment(this, -100, "neutron");
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
        this.leaderboard.push(self.add.text(920, 20 + 20 * i, "").setColor("#00ff00"));
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
            self.leaderboard[i].setScrollFactor(0);
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

    this.socket.on('explosion', function (bulletInfo) {
        var explosion = new Explosion(self, bulletInfo.x, bulletInfo.y)
    });
    var time;
    var timeDifference;
    var timeArray = [];
    var avg = 0;

    var t1 = 0;
    //displays other players' movement on screenloc
    this.socket.on('playerMoved', function (playerInfo) {
        tickRate = 20;
        // actual code
        var past = 1000 / tickRate;

        playerDict = playerInfo.playersKey;

        if (t1 > 0) {

            self.otherElements.getChildren().forEach((otherElement) => {

                var id = otherElement.playerId;
                var boogie = playerDict[id];

                //otherElement.playerId - contains the socket id
                //rhun a searc through tempPlayers to find the corresponding socket id
                //if search returns -1, then we just


                var now = Date.now();
                var renderTime = now - past; // the exact time (in the past) for which we will create a position, in this case this is ~1 tick ago

                // timestamp of a previous position (presumably one tick older than t2)
                t1 = tempTime;
                // timestamp of most recent position update form server
                var t2 = playerInfo.time;


                // if we have positional data within this time range
                if (renderTime <= t2 && renderTime >= t1) {
                    // total time from t1 to t2
                    var total = t2 - t1;
                    // how far between t1 and t2 this entity is as of 'renderTime'
                    var portion = renderTime - t1;

                    // fractional distance between t1 and t2
                    var ratio = portion / total;
                    //

                    // Calculating interpolation x and y in order to set position

                    var interpX = Math.lerp(tempPlayers[id].x, boogie.x, ratio);
                    var interpY = Math.lerp(tempPlayers[id].y, boogie.y, ratio);
                    console.log(id);
                    console.log(interpX)
                    console.log(interpY);
                    // setting other elements position
                    otherElement.setPosition(interpX, interpY);
                    // chris a dumbass
                } else {
                    // no interpolation at all, just draw the raw position
                    console.log("I LOVE JESUS");
                    otherElement.setPosition(boogie.x, boogie.y);
                    // in the actual code I attempt some extrapolation when draw is called in a range outside of t1 to t2
                    // this usually only occurs if the connection or server lag, and renderTime falls into a window for which we have yet
                    // to receive any data
                    // tuning the variable 'past' can minimize
                }

            });
        }
        else{
            t1 = 1;
            var t2 = playerInfo.time;
        }

        tempTime = t2;
        tempPlayers = playerDict;


        let j = 0;
        if (typeof last_processed_input != "undefined") {
            while (j < movementCommands.length) {
                var input = movementCommands[j];
                if (input.i <= last_processed_input) {
                    movementCommands.splice(j, 1);
                }
                else {
                    rotation = movementCommands[j].data[2];
                    position.x += gameSettings.playerSpeed / 60 * movementCommands[j].data[1];
                    position.y += gameSettings.playerSpeed / 60 * movementCommands[j].data[0];
                    j++;
                }
            }
        }


    });

    //add this player onto the screen
    function addPlayer(self, playerInfo) {
        self.element = new Element(self, playerInfo.x, playerInfo.y, 45, playerInfo.playerId, "hydrogen");
        self.element.setScale(0.4);
        self.element.oldPosition = {
            x: self.element.x,
            y: self.element.y,
            rotation: self.element.rotation
        };
        self.element.body.enable = true;
        //self.hp = new HealthBar(self, self.element.x - 50, self.element.y + 70);

        self.killScoreText = self.add.text(16, 40, 'Kills: ' + (0), { fontSize: '25px', fill: '#00FF00' });
        self.healthLabel = self.add.text(16, 10, "Health: 100", { fontSize: '25px', fill: '#00FF00' });

        playerX = self.element.x;
        playerY = self.element.y;
        //create score text on top left
        self.scoreText = self.add.text(16, 70, 'Score: ' + (0), { fontSize: '25px', fill: '#00FF00' });
        self.healthLabel.setScrollFactor(0);
        self.killScoreText.setScrollFactor(0);
        self.scoreText.setScrollFactor(0);
    }

    //add other players onto the screen
    function addOtherPlayers(self, playerInfo) {

        // +1.75, +3.11 determined by proportion of game width to game height
        if (playerInfo.atomicNumServer < texLen + 1) {
            const otherElement = new Element(self, playerInfo.x + 1.7, playerInfo.y + 2.9, 45, playerInfo.playerId, this.gameSettings.texture[playerInfo.atomicNumServer - 1]);
            otherElement.hp.destroy();
            self.otherElements.add(otherElement);
            otherElement.setScale(0.4);
            otherElement.body.enable = true;
            otherElement.timeUpdate = 0;
        }
        else {
            const otherElement = new Element(self, playerInfo.x + 1.7, playerInfo.y + 2.9, 45, playerInfo.playerId, this.gameSettings.texture[this.gameSettings.texture.length - 1]);
            otherElement.hp.destroy();
            //otherElement.setTint(0x0000ff);
            self.otherElements.add(otherElement);
            otherElement.body.enable = true;
            otherElement.timeUpdate = 0;
        }
    }
    this.projectiles = this.add.group();

    //create leaderboard background image
    this.rect = new Phaser.Geom.Rectangle(900, 0, 300, 250);
    this.graphics = this.add.graphics({ fillStyle: { color: 0x000000 } });
    this.graphics.setScrollFactor(0);
    this.graphics.fillRectShape(this.rect);
    this.graphics.alpha = .3;
    this.leaderboardBg = this.graphics.generateTexture("leaderboardBg");

    this.rect2 = new Phaser.Geom.Rectangle(config.width - config.width / 10 - 50, config.height - config.height / 10 - 50, config.width / 10 + 16, config.height / 10 + 10);
    this.graphics2 = this.add.graphics({ fillStyle: { color: 0x000000 } });
    this.graphics2.setScrollFactor(0);
    this.graphics2.fillRectShape(this.rect2);
    this.graphics2.alpha = .5
    this.minimapBg = this.graphics2.generateTexture("minimapBg");


    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.whiteSquare = new Phaser.Geom.Rectangle(config.width - config.width / 10 - 50, config.height - config.height / 10 - 50, 10, 10);
    this.dot = this.add.graphics({ fillStyle: { color: 0xffffff } });
    this.dot.setScrollFactor(0);
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
    this.atoms.setScrollFactor(0);
    this.protonBar.bar.setScrollFactor(0);
    this.electronBar.bar.setScrollFactor(0);
    this.neutronBar.bar.setScrollFactor(0);


    /*function entityInterpolation() {
        //console.log(Date.now()-date);
        //date = Date.now();


        // Position 1 
        // Position 2
        //Position 3
        //Position 4
        //Position 5
        //client time
        //current Position 
        //(Date.now - client time) * Speed = deltax, delta y
        //gs1 + deltax > gs2:


        //entity interpolation option 1
        self.otherElements.getChildren().forEach((otherElement) => {
            if (otherElement.updateArray.length > 1) {
                //console.log(otherElement.updateArray[0]);
                //console.log(otherElement.updateArray[1]);
                var timedif = Date.now() - otherElement.updateArray[0].time;
                var deltax = timedif / 1000 * gameSettings.playerSpeed;
                var deltay = timedif / 1000 * gameSettings.playerSpeed;
                var deltar = (otherElement.updateArray[1].r - otherElement.updateArray[0].r) * timedif / (otherElement.updateArray[1].time - otherElement.updateArray[0].time);
                var correcteddx = deltax;
                var correcteddy = deltay;
                if (otherElement.updateArray[1].x == otherElement.updateArray[0].x) {
                    correcteddx = 0;
                }
                else {
                    if (otherElement.updateArray[1].x < otherElement.updateArray[0].x) {
                        correcteddx = -correcteddx;
                    }
                }
                if (otherElement.updateArray[1].y == otherElement.updateArray[0].y) {
                    correcteddy = 0;
                }
                else {
                    if (otherElement.updateArray[1].y < otherElement.updateArray[0].y) {
                        correcteddy = -correcteddy;
                    }
                }

                //console.log(timedif, deltax, deltay);
                if (deltax + otherElement.updateArray[0].x > otherElement.updateArray[1].x && deltay + otherElement.updateArray[0].y > otherElement.updateArray[1].y) {
                    while (deltax + otherElement.updateArray[0].x > otherElement.updateArray[1].x && deltay + otherElement.updateArray[0].y > otherElement.updateArray[1].y && //in case movement
                        timedif > otherElement.updateArray[1].time - otherElement.updateArray[0].time) {
                        otherElement.setPosition(otherElement.updateArray[1].x, otherElement.updateArray[1].y);
                        //otherElement.setPosition(otherElement.updateArray[1].x, otherElement.updateArray[1].y);
                        //self.physics.moveTo(otherElement, otherElement.updateArray[1].x, otherElement.updateArray[1].y, 300)
                        otherElement.rotation = otherElement.updateArray[1].r;
                        otherElement.updateArray.shift();
                        if (otherElement.updateArray.length < 2) {
                            break;
                        }
                        //console.log(self.physics);
                    }
                }
                else {
                    //console.log(correcteddx, correcteddy);
                    otherElement.setPosition(otherElement.updateArray[0].x + correcteddx, otherElement.updateArray[0].y + correcteddy);
                    //self.physics.moveTo(otherElement, otherElement.updateArray[0].x + correcteddx, otherElement.updateArray[0].y + correcteddy, 300);
                    otherElement.rotation = otherElement.updateArray[0].r + deltar;
                }
            }
            //console.log(otherElement.x, otherElement.y)
        });
    }
    setInterval(entityInterpolation, 16)*/

}

var d;
let g = 0;
let counter = 0;

function update(time) {
    if (typeof this.element != "undefined") {
        //this.element.bringToTop();


        this.cameras.main.startFollow(this.element);
        this.cameras.main.followOffset.set(5, 5);

        if (gameSettings.lanthanides.includes(this.element.atomicNum)) {
            this.cameras.main.setZoom(0.7);
        }
        else {
            this.cameras.main.setZoom(1);
        }
        //Phaser.Math.Clamp

        //dist2 = Math.pow(players[id0].x - players[id].x, 2) + Math.pow(players[id0].y - players[id].y, 2);
        //move this out
        movement_command = this.element.movePlayer(this, gameSettings.playerSpeed, isHit, this.knockbackSpeedX, this.knockbackSpeedY, this.transitionBulletAngle, isOverlappingOther);
        var movementData = {
            data: movement_command,
            i: messageIndex,
            time: Date.now(),
            id: this.element.playerId
        };
        messageIndex++;
        movementCommands.push(movementData);
        this.socket.emit('move', movementData);


        this.healthLabel.text = "Health: " + this.element.hp.value;

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

        this.dot.x = this.element.x / 30;
        this.dot.y = this.element.y / 26.5;

        count++;

        for (let k = 0; k < this.element.bullet_array.length; k++) {
            if (typeof this.element.bullet_array[k].actualX != "undefined") {
                this.element.bullet_array[k].x = this.element.bullet_array[k].actualX;
                this.element.bullet_array[k].y = this.element.bullet_array[k].actualY;
                this.element.bullet_array[k].setVisible(true);

                this.element.bullet_array[k].actualX = undefined;
            }
            // if(this.element.bullet_array[k].owner_id != this.socket.id){
            //     this.element.bullet_array[k].setVisible(true);
            // }
            //console.log(this.element.bullet_array[k].x);


            let speedY = gameSettings.bulletSpeed * Math.sin(this.element.bullet_array[k].angle2);
            let speedX = gameSettings.bulletSpeed * Math.cos(this.element.bullet_array[k].angle2);

            // if (gameSettings.group8.includes(this.element.atomicNum)) {

            //     speedY = (-20 + 60 * this.element.bullet_array[k].increment) * Math.sin(this.element.bullet_array[k].angle2);
            //     speedX = (-20 + 60 * this.element.bullet_array[k].increment) * Math.cos(this.element.bullet_array[k].angle2);

            //     // speedY = speedY + 20*this.element.bullet_array[k].increment;
            //     // speedX = speedX + 20*this.element.bullet_array[k].increment;
            //     this.element.bullet_array[k].increment++;
            // }

            //let speedY = gameSettings.bulletSpeed * Math.sin(this.element.bullet_array[k].angle2);
            //let speedX = gameSettings.bulletSpeed * Math.cos(this.element.bullet_array[k].angle2);

            // if (gameSettings.lanthanides.includes(this.element.atomicNum)) {
            //     speedY = gameSettings.bulletSpeed * 2 * Math.sin(this.element.bullet_array[k].angle2);
            //     speedX = gameSettings.bulletSpeed * 2 * Math.cos(this.element.bullet_array[k].angle2);
            // }

            // if (gameSettings.group5.includes(this.element.atomicNum)) {

            //     speedY = (100 * this.element.bullet_array[k].increment) * Math.sin(this.element.bullet_array[k].angle2);
            //     speedX = (100 * this.element.bullet_array[k].increment) * Math.cos(this.element.bullet_array[k].angle2);
            //     this.element.bullet_array[k].increment++;
            // }


            this.element.bullet_array[k].x += speedX / 60;
            this.element.bullet_array[k].y += speedY / 60;


            this.otherElements.getChildren().forEach((otherElement) => {

                let dist = Math.sqrt(Math.pow(otherElement.x - this.element.bullet_array[k].x, 2) + Math.pow(otherElement.y - this.element.bullet_array[k].y, 2));
                if (dist < 70 && !(gameSettings.group8.includes(this.element.atomicNum) || gameSettings.group7.includes(this.element.atomicNum))) {
                    if (this.element.bullet_array[k].owner_id != otherElement.playerId) {
                        this.element.bullet_array[k].setVisible(false);
                    }

                }

            });

            let dist0 = Math.sqrt(Math.pow(this.element.x - this.element.bullet_array[k].x, 2) + Math.pow(this.element.y - this.element.bullet_array[k].y, 2));

            if (dist0 < 70 && this.element.bullet_array[k].owner_id != this.socket.id) {
                this.element.bullet_array[k].setVisible(false);
            }

            if (this.element.bullet_array[k].owner_id == this.socket.id && (this.element.bullet_array[k].x < -10 || this.element.bullet_array[k].x > gameSettings.mapWidth + 10 || this.element.bullet_array[k].y < -10 || this.element.bullet_array[k].y > gameSettings.mapHeight + 10)) {
                this.element.bullet_array[k].destroy();
                this.element.bullet_array.splice(k, 1);
            }

        }


        if ((this.input.activePointer.isDown || Phaser.Input.Keyboard.JustDown(this.spacebar)) && (lastShot + 500 < time || (lastShot + 250 < time && this.element.atomicNum == 2))) {
            let bullet = this.element.shootBullet(this);

            let bulletAngle = Phaser.Math.Angle.Between(this.element.x, this.element.y, this.input.activePointer.worldX, this.input.activePointer.worldY);

            if (gameSettings.group8.includes(this.element.atomicNum)) {
                group8Bullet(this, bullet, this.element, this.socket, bulletAngle, bulletAngle);
            }
            else if (gameSettings.group2.includes(this.element.atomicNum)) {
                let distance = Math.sqrt((bullet.x - this.element.x) * (bullet.x - this.element.x) + (bullet.y - this.element.y) * (bullet.y - this.element.y));
                group2Bullet(this, bullet, 35, this.element, this.socket, bulletAngle);
            }
            else if (gameSettings.group3.includes(this.element.atomicNum)) {
                group3Bullet(this, bullet, this.element, this.socket, bulletAngle);
            }
            else if (gameSettings.group4.includes(this.element.atomicNum)) {
                group4Bullet(this, bullet, this.element, this.socket, bulletAngle);
            }
            else if (gameSettings.group5.includes(this.element.atomicNum)) {
                group5Bullet(this, bullet, this.element, this.socket, bulletAngle);
            }
            else if (gameSettings.group6.includes(this.element.atomicNum)) {
                group6Bullet(this, bullet, this.element, this.socket, bulletAngle);
            }
            else if (gameSettings.group7.includes(this.element.atomicNum)) {
                group7Bullet(this, bullet, this.element, this.socket, bulletAngle);
            }
            else if (gameSettings.transitionmetals.includes(this.element.atomicNum)) {
                transitionMetalBullet(this, bullet, this.element, this.socket, bulletAngle);
            }
            else if (gameSettings.lanthanides.includes(this.element.atomicNum)) {
                lanthanideBullet(this, bullet, this.element, this.socket, bulletAngle);
            }
            else if (gameSettings.actinides.includes(this.element.atomicNum)) {
                actinideBullet(this, bullet, this.element, this.socket, bulletAngle);
            }
            else {
                //damage /= 10, NEED TO CHANGE, ONLY FOR TESTING
                group1Bullet(this, bullet, this.element, this.socket, bulletAngle);
            }
            lastShot = time;


        }

        if (lastScoreUpdate + 10000 < time) {
            if (typeof email != "object") {
                if (currentHighScore < this.score) {
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

                if (bestKills < this.element.kills) {
                    const data = {
                        email: email,
                        kills: this.element.kills,
                    };
                    $.ajax({
                        type: 'POST',
                        url: '/submit-kills',
                        data,
                        success: function (data) {
                        },
                        error: function (xhr) {
                        }
                    });
                    bestKills = this.element.kills;
                }
                if (bestElement < this.element.atomicNum) {
                    const data = {
                        email: email,
                        element: this.element.atomicNum,
                    };
                    //console.log(this.element.atomicNum);
                    //console.log(data);
                    $.ajax({
                        type: 'POST',
                        url: '/submit-element',
                        data,
                        success: function (data) {
                        },
                        error: function (xhr) {
                        }
                    });
                    bestElement = this.element.atomicNum;
                }
            }
            lastScoreUpdate = time;
        }

        if (Math.random() < 0.5) this.element.x += 0.000000001;
        else this.element.x -= 0.000000001;


        /*this.otherElements.getChildren().forEach((otherElement) => {
            var distance = Phaser.Math.Distance.Between(otherElement.x, otherElement.y, otherElement.destx, otherElement.y);
            if (otherElement.body.speed > 0) {
                console.log(distance);
                //  6 is our distance tolerance, i.e. how close the source can get to the target
                //  before it is considered as being there. The faster it moves, the more tolerance is required.
                if (distance < 6) {
                    otherElement.body.reset(otherElement.destx, otherElement.desty);
                }
            }
        });*/


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







        // TE(MP) TIME = T2 AT THE END OF THE FUNCTION
        //        var timeDifference;
        /*
        if (typeof time == "undefined") {
            time = Date.now();
            iter = 0;
        }
        else {
            if (timeDifference < 50) {
                console.log(avg/iter);
            }
            timeDifference = Date.now() - time;
            avg += timeDifference;
            time = Date.now();
            iter++;
            //console.log("iteration ", iter - 1, " to ", iter, ": ", timeDifference);
            timeArray.push(timeDifference);
        }
        
        var rotation = self.element.rotation;
        var position = { x: self.element.x, y: self.element.y };
        var last_processed_input;

        
        Object.keys(playerInfo).forEach(function (key) {
            //console.log(key + " " + playerInfo[key]);

            if (playerInfo[key].playerId == self.socket.id) {
                rotation = playerInfo[key].rotation;
                position = { x: playerInfo[key].x, y: playerInfo[key].y };
                last_processed_input = playerInfo[key].client_num;
            }
            else {
                //console.log(playerInfo[key].rotation);
                self.otherElements.getChildren().forEach((otherElement) => {
                    if (otherElement.playerId == playerInfo[key].playerId) {
                        //self.physics.moveTo(otherElement, playerInfo[key].x, playerInfo[key].y, 300);
                        //otherElement.destx = playerInfo[key].x;
                        //otherElement.desty = playerInfo[key].y;
                        otherElement.updateArray.push({ x: playerInfo[key].x, y: playerInfo[key].y, r: playerInfo[key].rotation, time: Date.now() });
                    }
                });
            }
        });


        for (let i = 0; i < playerInfo.length; i++) {
            if (playerInfo[i].playerId == self.socket.id) {
                rotation = playerInfo[i].rotation;
                position = { x: playerInfo[i].x, y: playerInfo[i].y };
                last_processed_input = playerInfo[i].client_num;
            }
            else {
                self.otherElements.getChildren().forEach((otherElement) => {
                    if (otherElement.playerId == playerInfo[i].playerId) {
                        otherElement.updateArray.push({ x: playerInfo[i].x, y: playerInfo[i].y, r: playerInfo[i].rotation, time:Date.now()});
                    }
                });
            }
        }
        
        if (timeArray.length > 1) {
            timeArray.shift();
        }
        */

