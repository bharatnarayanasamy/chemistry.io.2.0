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
const secureRoutes = require('./routes/secure');

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
app.get('/game.html', passport.authenticate('jwt', { session : false }), function (req, res) {
  res.sendFile(__dirname + '/public/game.html');
});

// main routes
app.use('/', routes);
app.use('/', passport.authenticate('jwt', { session: false }), secureRoutes);

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

  // when a player moves, update the player data
  socket.on('playerMovement', (movementData) => {
    if (typeof players[socket.id] != "undefined") {
      players[socket.id].x = movementData.x; //update player position
      players[socket.id].y = movementData.y;
      players[socket.id].rotation = movementData.rotation;
      // emit a message to all players about the player that moved
      socket.broadcast.emit('playerMoved', players[socket.id]);
    }
  });

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
    if(data.atomicNumber == 5) {
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
      
      let longdist = 1000000;

      if (typeof players[bullet.owner_id] != "undefined" &&  players[bullet.owner_id].atomicNumServer == 7){
        //group5Bullet
        bullet_array[i].bulletSpeed += 10;
      }   
      
      if (typeof players[bullet.owner_id] != "undefined" &&  players[bullet.owner_id].atomicNumServer == 9){
        //group 7 bullet
        if (bullet_array[i].bulletSpeed > 20) {
          bullet_array[i].bulletSpeed -= 7;
        }
        else
        {
          bullet_array[i].bulletSpeed = 10;
        }

        longdist = 38000;
      }   
      
      if (typeof players[bullet.owner_id] != "undefined" && players[bullet.owner_id].atomicNumServer == 57)
      {
        //lanthanides
        longdist = 1500*1500;
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
            thresh = 70
            //if(players[owner].atomicNumServer == 3) {
                //thresh = 500;            
            //}
            if (dist < thresh) {
              healthInfo.i = i;
              healthInfo.id = id;
              if(typeof players[bullet.owner_id] != "undefined") healthInfo.atomicNumber = players[bullet.owner_id].atomicNumServer;
              healthInfo.speedX = speedX;
              healthInfo.speedY = speedY;
              healthInfo.bulletAngle = bullet.angle;
              io.emit('player-hit', healthInfo); // Tell everyone this player got hit
              players[id].health -= bullet.damage;
              io.emit("update-health", players[id]);
              if (players[owner].atomicNumServer == 21){
                //transition metals
                io.emit('playerMoved', players[id]);
              }

              if (typeof players[owner] != "undefined" && ![2,9].includes(players[owner].atomicNumServer)) {
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

setInterval(ServerGameLoop, 16);
setInterval(UpdateLeaderboard, 100);



/*
      if (typeof players[bullet.owner_id] != "undefined" && players[bullet.owner_id].atomicNumServer > 1) {
        //actinideBullet
        let dx0 = players[bullet.owner_id].x - bullet.x;
        let dy0 = players[bullet.owner_id].y - bullet.y;
        let dist0 = Math.sqrt(dx0 * dx0 + dy0 * dy0);

        if (dist0 > 300 && typeof bullet.firstBullet != "undefined" && bullet.firstBullet==true) {

          let bullet0 = { x: bullet.x, y: bullet.y, angle: bullet.angle + 0.2, bulletSpeed: bullet.bulletSpeed, damage: bullet.damage, atomicNumber: bullet.atomicNumber }
          let bullet1 = { x: bullet.x, y: bullet.y, angle: bullet.angle - 0.2, bulletSpeed: bullet.bulletSpeed, damage: bullet.damage, atomicNumber: bullet.atomicNumber };

          //bullet0.angle += 0.2;
          //bullet1.angle -= 0.2;

          bullet0.ix = bullet.ix;  //set initial positions of bullet to track distance travel;ed
          bullet1.ix = bullet.ix;

          bullet0.iy = bullet.iy;
          bullet1.iy = bullet.iy;

          bullet_array.push(bullet0);
          bullet_array.push(bullet1);
          bullet.firstBullet = false;
        }
      }
*/