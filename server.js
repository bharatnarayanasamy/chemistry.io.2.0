// reads in our .env file and makes those values available as environment variables
require('dotenv').config();

let express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');
var fs = require('fs');

// create an instance of an express app
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

const PORT = process.env.PORT || 5000;

const routes = require('./routes/main');

// setup mongo connection
const uri = process.env.MONGO_CONNECTION_URL;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });
mongoose.connection.on('error', (error) => {
  console.log(error);
  process.exit(1);
});
mongoose.connection.on('connected', function () {
  console.log('connected to mongo');
});

// update express settings
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(cookieParser());

// require passport auth
require('./auth/auth');

/**app.get('/game.html', function (req, res) {
  res.sendFile(__dirname + '/public/game.html');
});**/

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/game.html', passport.authenticate('jwt', { session: false }), function (req, res) {
  res.sendFile(__dirname + '/public/game.html');
});
app.get('/loggedin.html', passport.authenticate('jwt', { session: false }), function (req, res) {
  res.sendFile(__dirname + '/public/loggedin.html');
});

// main routes
app.use('/', routes);

// catch all other routes
app.use((req, res, next) => {
  res.status(404).json({ message: '404 - Not Found' });
});

// handle errors
app.use((err, req, res, next) => {
  // TODO: add note about updating this
  console.log(err.message);
  res.status(err.status || 500).json({ error: err.message });
});

server.listen(PORT, () => {
  console.log(`Listening on ${server.address().port}`);
});

//Creating data storage objects
let players = {};
let bullet_array = [];
//score_array stores the scores for the protons/electrons/neutrons
let score_array = {};
//player_scores stores
let player_scores = {};
let healthInfo = {
  id: 0,
  i: 0,
  atomicNumber: 0
}
let socketID;
let proton_array = [];
let electron_array = [];
let neutron_array = [];

let gameWidth = 3840;
let gameHeight = 2080;

let leaderboardArray = {};

let proton = {
  x: Math.floor(Math.random() * 1100) + 50,
  y: Math.floor(Math.random() * 700) + 50,
};

let electron = {
  x: Math.floor(Math.random() * 1100) + 50,
  y: Math.floor(Math.random() * 700) + 50,
};
let neutron = {
  x: Math.floor(Math.random() * 1100) + 50,
  y: Math.floor(Math.random() * 700) + 50,
};

for (let i = 0; i < 15; i++) {
  proton_array.push({
    x: Math.floor(Math.random() * 3840) + 50,
    y: Math.floor(Math.random() * 2080) + 50
  });

}

for (let i = 0; i < 15; i++) {

  electron_array.push({
    x: Math.floor(Math.random() * 3840) + 50,
    y: Math.floor(Math.random() * 2080) + 50
  });

}

for (let i = 0; i < 15; i++) {

  neutron_array.push({
    x: Math.floor(Math.random() * 3840) + 50,
    y: Math.floor(Math.random() * 2080) + 50
  });

}
var serverSettings = {
  playerSpeed: 300, //normally 300
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

var game_array = [];

//Initialize function for what happens when connection occurs
io.on('connection', (socket) => {
  socketID = socket.id;
  console.log('a user connected');
  // create a new player and add it to our players object
  players[socket.id] = {
    x: Math.floor(Math.random() * gameWidth - 100) + 50, //initialize positions
    y: Math.floor(Math.random() * gameHeight - 100) + 50,
    vx: 0, //initial player velocity =  0
    vy: 0,
    rotation: 0,
    playerId: socket.id, //assign player id
    health: 100, //default health = 100
    kills: 0,
    atomicNumServer: 1 //player level
  };

  player_scores[socket.id] = 0;
  leaderboardArray[socket.id] = "";

  //create new entry in the score_array object for this specific player, initialize scores into 0
  score_array[socket.id] = {
    protonScore: 0,
    electronScore: 0,
    neutronScore: 0,
    id: socket.id
  }

  //Tell client which players are currently in the game so it can create them
  socket.emit('currentPlayers', players);

  //assign the proton object information on every player's score
  proton.score = score_array;
  electron.score = score_array;
  neutron.score = score_array;

  //tell client to create proton, electron and neutron
  socket.emit('protonUpdate', proton_array);
  socket.emit('electronUpdate', electron_array);
  socket.emit('neutronUpdate', neutron_array);

  socket.emit('updateTheLeaderboard');

  //Inform all clients that a new player joined
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', () => {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    delete score_array[socket.id];
    
    delete player_scores[socket.id];
    delete leaderboardArray[socket.id];

    // emit a message to all players to remove this player from their client
    io.emit('disconnect', socket.id);
  });

  socket.on('move', (movementData) => {
    //ORDER =          W/S   A/D
    //W and D are 1, S and A are -1
    var data = {};
    data.time = Date.now();

    if (typeof players[socket.id] != "undefined") {


      players[socket.id].x += serverSettings.playerSpeed / 60 * movementData[1];
      players[socket.id].y += serverSettings.playerSpeed / 60 * movementData[0];

      data.x = players[socket.id].x;
      data.y = players[socket.id].y;
      data.rotation = movementData[2];
      data.playerId = socket.id;
      game_array.push(data);

    }
    //add seq number

    //console.log(players[socket.id].x);
    //console.log(players[socket.id].y);

  });

  /** 
  // when a player moves, update the player data
  socket.on('playerMovement', (movementData) => {
    if (typeof players[socket.id] != "undefined") {
      players[socket.id].x = movementData.x; //update player position
      players[socket.id].y = movementData.y;
      players[socket.id].rotation = movementData.rotation;
      // emit a message to all players about the player that moved
      socket.broadcast.emit('playerMoved', players[socket.id]);
    }
  });**/

  //when protons get collected, this resets its position and increases the score in the entire score array
  socket.on('protonCollected', function (i) {
    proton_array[i].x = Math.floor(Math.random() * 3840) + 50;
    proton_array[i].y = Math.floor(Math.random() * 2080) + 50;
    if (typeof score_array[socket.id] != "undefined") {
      //if (score_array[socket.id].protonScore < 2) {
      score_array[socket.id].protonScore++;
      //}

      proton.score = score_array;
    }
    io.emit('protonUpdate', proton_array);
  });

  //when electrons get collected, this resets its position and increases the score in the entire score array
  socket.on('electronCollected', function (i) {
    electron_array[i].x = Math.floor(Math.random() * 3840) + 50;
    electron_array[i].y = Math.floor(Math.random() * 2080) + 50;
    if (typeof score_array[socket.id] != "undefined") {
      //if (score_array[socket.id].electronScore < 2) {
      score_array[socket.id].electronScore++;
      // }
      electron.score = score_array;
    }
    io.emit('electronUpdate', electron_array);
  });

  //when neutrons get collected, this resets its position and increases the score in the entire score array
  socket.on('neutronCollected', function (i) {
    neutron_array[i].x = Math.floor(Math.random() * 3840) + 50;
    neutron_array[i].y = Math.floor(Math.random() * 2080) + 50;
    if (typeof score_array[socket.id] != "undefined") {
      //if (score_array[socket.id].neutronScore < 2) {
      score_array[socket.id].neutronScore++;
      // }
      neutron.score = score_array;
    }
    io.emit('neutronUpdate', neutron_array);
  });

  //Player's health regen
  socket.on('player-heal', (data) => {
    if (typeof players[data.id] != 'undefined') {
      if (players[data.id].health <= 97) {
        players[data.id].health += 3;
      }
      else {
        players[data.id].health = 100;
      }
      io.emit("update-health", players[data.id]);
    }
  });

  // Listen for shoot-bullet events and add it to our bullet array
  socket.on('shoot-bullet', (data) => {
    if (players[socket.id] == undefined) return;
    data.owner_id = socket.id; // Attach id of the player to the bullet
    data.ix = data.x;  //set initial positions of bullet to track distance travel;ed
    data.iy = data.y;

    //CHANGE BEFORE FINAL
    if (data.atomicNumber == 5) {
      data.bulletSpeed /= 3;
    }
    let new_bullet = data;
    bullet_array.push(new_bullet);
  });

  //gets called once a player is ready to upgrade
  socket.on('upgrade', (atomicNum) => {
    if (players[socket.id] != undefined) {
      //CONSIDER JUST DOING ATOMICNUMSERVER++
      players[socket.id].atomicNumServer = atomicNum; //increases level
      score_array[socket.id].protonScore = 0; //resets proton collection numbers
      score_array[socket.id].neutronScore = 0;
      score_array[socket.id].electronScore = 0;

      socket.broadcast.emit('playerUpgraded', players[socket.id]);
    }
  });

  socket.on('scoreUpdate', function (player) {
    if (player_scores[player.id] != undefined) {
      player_scores[player.id] = player.sc;
    }
  });


  socket.on('usernameInfo', function (usernameInfo) {

    leaderboardArray[usernameInfo.id] = usernameInfo.username;
  });
});
// Update the bullets 60 times per frame and send updates
function ServerGameLoop() {
  for (let i = 0; i < bullet_array.length; i++) {
    let bullet = bullet_array[i];
    if (typeof bullet != "undefined") {
      let speed = bullet.bulletSpeed;
      let speedY = speed * Math.sin(bullet.angle);
      let speedX = speed * Math.cos(bullet.angle);

      bullet.x += speedX / 60; //update bullet position
      bullet.y += speedY / 60;

      if (typeof players[bullet.owner_id] != "undefined" && serverSettings.actinides.includes(players[bullet.owner_id].atomicNumServer)) {
        let dx0 = players[bullet.owner_id].x - bullet.x;
        let dy0 = players[bullet.owner_id].y - bullet.y;
        let dist0 = Math.sqrt(dx0 * dx0 + dy0 * dy0);

        if (dist0 > 300 && typeof bullet.firstBullet != "undefined" && bullet.firstBullet == true) {

          let bullet0 = { x: bullet.x, y: bullet.y, angle: bullet.angle + 0.2, bulletSpeed: bullet.bulletSpeed, damage: bullet.damage, atomicNumber: bullet.atomicNumber }
          let bullet1 = { x: bullet.x, y: bullet.y, angle: bullet.angle - 0.2, bulletSpeed: bullet.bulletSpeed, damage: bullet.damage, atomicNumber: bullet.atomicNumber };

          //bullet0.angle += 0.2;
          //bullet1.angle -= 0.2;

          bullet0.ix = bullet.ix;  //set initial positions of bullet to track distance traveled
          bullet1.ix = bullet.ix;

          bullet0.iy = bullet.iy;
          bullet1.iy = bullet.iy;

          bullet_array.push(bullet0);
          bullet_array.push(bullet1);
          bullet.firstBullet = false;
        }
      }

      let longdist = 1000000;

      if (typeof players[bullet.owner_id] != "undefined" && serverSettings.group3.includes(players[bullet.owner_id].atomicNumServer)) {
        longdist = 20000;
      }

      if (typeof players[bullet.owner_id] != "undefined" && serverSettings.group5.includes(players[bullet.owner_id].atomicNumServer)) {
        bullet_array[i].bulletSpeed += 20;
      }

      if (typeof players[bullet.owner_id] != "undefined" && serverSettings.group7.includes(players[bullet.owner_id].atomicNumServer)) {
        if (bullet_array[i].bulletSpeed > 20) {
          bullet_array[i].bulletSpeed -= 7;
        }
        else {
          bullet_array[i].bulletSpeed = 10;
        }

        longdist = 30000;
      }

      if (typeof players[bullet.owner_id] != "undefined" && serverSettings.lanthanides.includes(players[bullet.owner_id].atomicNumServer)) {
        longdist = 2250000;
      }

      // Remove if it goes off screen
      if (bullet.x < -10 || bullet.x > gameWidth + 10 || bullet.y < -10 || bullet.y > gameHeight + 10) {
        bullet_array.splice(i, 1);
        i--;
      }

      //Remove bullet once it has travelled 1000 units
      if ((Math.pow(bullet.x - bullet.ix, 2) + Math.pow(bullet.y - bullet.iy, 2)) > longdist) {
        bullet_array.splice(i, 1);
        i--;
      }

      for (let id in players) {
        if (bullet.owner_id != id && typeof players[id] != "undefined") {
          //Your own bullet shouldn't kill you
          let dx = players[id].x - bullet.x;
          let dy = players[id].y - bullet.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          let owner = bullet.owner_id;
          thresh = 70;
          if (dist < thresh) {
            healthInfo.i = i;
            healthInfo.id = id;
            if (typeof players[bullet.owner_id] != "undefined") healthInfo.atomicNumber = players[bullet.owner_id].atomicNumServer;
            healthInfo.speedX = speedX;
            healthInfo.speedY = speedY;
            healthInfo.bulletAngle = bullet.angle;
            io.emit('player-hit', healthInfo); // Tell everyone this player got hit
            players[id].health -= bullet.damage;
            io.emit("update-health", players[id]);
            if (typeof players[bullet.owner_id] != "undefined" && serverSettings.group5.includes(players[bullet.owner_id].atomicNumServer)) {
              let bulletInfo = { x: bullet.x, y: bullet.y }
              io.emit("explosion", bulletInfo)
              for (let id in players) {
                dist = Math.pow(players[id].x - bullet.x, 2) + Math.pow(players[id].y - bullet.y, 2);
                if (id != healthInfo.id && dist < 30000) {
                  healthInfo.id = id;
                  io.emit('player-hit', healthInfo);
                  players[id].health -= Math.round(bullet.damage * (1 - dist / 30000));
                  io.emit("update-health", players[id]);
                }
              }
            }

            if (typeof players[owner] != "undefined" && !(serverSettings.group8.includes(players[owner].atomicNumServer) || serverSettings.group7.includes(players[owner].atomicNumServer))) {
              bullet_array.splice(i, 1);
              i--;
            }
          }
          if (players[id].health <= 0) {
            if (typeof players[owner] != "undefined") {
              players[owner].kills++;
              if (id == socketID) {
                delete players[id];
                delete score_array[id];
                io.emit('deleteDeadPlayers', id);
                io.emit('updateKills', players[owner]);
              }
              else {
                io.emit('deleteDeadPlayers', id);
                io.emit('updateKills', players[owner]);
                delete players[id];
                delete score_array[id];
              }
            }
          }
        }
      }
    }
    // Tell everyone where all the bullets are by sending the whole array
    io.emit("bullets-update", bullet_array);
  }
}


// Update the bullets 60 times per frame and send updates
function UpdateLeaderboard() {
  // Create items array
  var items = Object.keys(player_scores).map(function (key) {
    return [leaderboardArray[key], key, player_scores[key]];
  });

  // Sort the array based on the second element
  items.sort(function (first, second) {
    return second[2] - first[2];
  });

  // Tell everyone where all the bullets are by sending the whole array
  io.emit("update-leaderboard", items);
}

function Movement() {

  let messageArray = [];
  while (typeof game_array[0] != "undefined" && game_array[0].time + 50 < Date.now()) {
    messageArray.push(game_array[0]);
    game_array.shift();
  }
  io.emit('playerMoved', messageArray);
}

setInterval(Movement, 100);
setInterval(ServerGameLoop, 16);
setInterval(UpdateLeaderboard, 100);




