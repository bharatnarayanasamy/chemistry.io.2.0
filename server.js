//technical server stuff
let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//Access server on localhost:8083
server.listen(8083, () => {
  console.log(`Listening on ${server.address().port}`);
});

//Creating data storage objects
let players = {};
let bullet_array = [];
let score_array = {};
let healthInfo = {
  id: 0,
  i: 0
}
let socketID;
let proton_array = [];
let electron_array = [];
let neutron_array = [];
let gameWidth = 3840;
let gameHeight = 2080;



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


//Test if we need this data structure later
let data = {
  x: 0,
  y: 0,
  id: 0,
  score: 0
};

//Initialize function for what happens when connection occurs
io.on('connection', (socket) => {
  socketID = socket.id;
  console.log('a user connected');
  // create a new player and add it to our players object
  players[socket.id] = {
    x: Math.floor(Math.random() * gameWidth-100) + 50, //initialize positions
    y: Math.floor(Math.random() * gameHeight-100) + 50,
    vx: 0, //initial player velocity =  0
    vy: 0,
    rotation: 0,
    playerId: socket.id, //assign player id
    health: 100, //default health = 100
    kills: 0,
    atomicNumServer: 1 //player level
  };

  //create new entry in the score_array object for this specific player, initialize scores into 0
  score_array[socket.id] = {
    protonScore: 0,
    electronScore: 0,
    neutronScore: 0,
    id: socket.id
  }
  

  for (let i = 0; i < 15; i++) {

    proton_array.push({
      x: Math.floor(Math.random() * 1100) + 50,
      y: Math.floor(Math.random() * 700) + 50
    });
    
  }


  //Tell client which players are currently in the game so it can create them
  socket.emit('currentPlayers', players);

  //assign the proton object information on every player's score
  proton.score = score_array;
  electron.score = score_array;
  neutron.score = score_array;

  //tell client to create proton, electron and neutron
  socket.emit('protonUpdate', proton_array);
  socket.emit('electronUpdate', electron);
  socket.emit('neutronUpdate', neutron);

  //Inform all clients that a new player joined
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // when a player disconnects, remove them from our players object
  socket.on('disconnect',  () => {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    delete score_array[socket.id];
    // emit a message to all players to remove this player from their client
    io.emit('disconnect', socket.id);
  });

  // when a player moves, update the player data 
  socket.on('playerMovement', (movementData) => {
    if (typeof players[socket.id] != "undefined") {
      players[socket.id].x = movementData.x; //update player position
      players[socket.id].y = movementData.y;
      players[socket.id].vy = movementData.vy; //update player velocity
      players[socket.id].vx = movementData.vx;
      players[socket.id].rotation = movementData.rotation;
      // emit a message to all players about the player that moved
      socket.broadcast.emit('playerMoved', players[socket.id]);
    }
  });

  //when protons get collected, this resets its position and increases the score in the entire score array
  socket.on('protonCollected', function(i) {
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
  socket.on('electronCollected', () => {
    electron.x = Math.floor(Math.random() * 3840) + 50;
    electron.y = Math.floor(Math.random() * 2080) + 50;
    if (typeof score_array[socket.id] != "undefined") {
      //if (score_array[socket.id].electronScore < 2) {
        score_array[socket.id].electronScore++;
     // }
      electron.score = score_array;
    }
    io.emit('electronUpdate', electron);
  });

  //when neutrons get collected, this resets its position and increases the score in the entire score array
  socket.on('neutronCollected', () => {
    neutron.x = Math.floor(Math.random() * 3840) + 50;
    neutron.y = Math.floor(Math.random() * 2080) + 50;
    if (typeof score_array[socket.id] != "undefined") {
      //if (score_array[socket.id].neutronScore < 2) {
        score_array[socket.id].neutronScore++;
     // }
      neutron.score = score_array;
    }
    io.emit('neutronUpdate', neutron);
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
    let new_bullet = data;
    bullet_array.push(new_bullet);
  });

  //gets called once a player is ready to upgrade
  socket.on('upgrade', (atomicNum) => {
    if (players[socket.id] != undefined) {
      players[socket.id].atomicNumServer = atomicNum; //increases level
      score_array[socket.id].protonScore = 0; //resets proton collection numbers 
      score_array[socket.id].neutronScore = 0;
      score_array[socket.id].electronScore = 0;

      socket.broadcast.emit('playerUpgraded', players[socket.id]);
    }
  });

});

// Update the bullets 60 times per frame and send updates 
function ServerGameLoop() {


  for (let i = 0; i < bullet_array.length; i++) {
    let bullet = bullet_array[i];
    if (typeof bullet != "undefined") {
      bullet.x += bullet.speed_x / 50; //update bullet position
      bullet.y += bullet.speed_y / 50;

      // Remove if it goes off screen
      if (bullet.x < -10 || bullet.x > gameWidth + 10 || bullet.y < -10 || bullet.y > gameHeight + 10) {
        bullet_array.splice(i, 1);
        i--;
      }

      //Remove bullet once it has travelled 1000 units
      if ((Math.pow(bullet.x - bullet.ix, 2) + Math.pow(bullet.y - bullet.iy, 2)) > 1000000) {
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
          if (dist < 70) {
            healthInfo.i = i;
            healthInfo.id = id;
            io.emit('player-hit', healthInfo); // Tell everyone this player got hit
            players[id].health -= bullet.damage;
            bullet_array.splice(i, 1);
            i--;
          }
          io.emit("update-health", players[id]);
          if (typeof players[id] != "undefined") {

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
    }
  }

  // Tell everyone where all the bullets are by sending the whole array
  io.emit("bullets-update", bullet_array);
}

setInterval(ServerGameLoop, 16);