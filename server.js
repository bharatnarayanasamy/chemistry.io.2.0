//technical server stuff
let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

//Access server on localhost:8083
server.listen(8084, () => {
  console.log(`Listening on ${server.address().port}`);
});

let players = {};
let bullet_array = [];
let score_array = {};
let healthInfo = {
  id: 0,
  i: 0
}

let socketID;

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
let data = {
  x: 0,
  y: 0,
  id: 0,
  score: 0
};


io.on('connection', function (socket) {
  socketID = socket.id;
  console.log('a user connected');
  // create a new player and add it to our players object
  players[socket.id] = {
    x: Math.floor(Math.random() * 1100) + 50,
    y: Math.floor(Math.random() * 700) + 50,
    vx: 0,
    vy: 0,
    rotation: 0,
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'green' : 'blue',
    health: 100,
    kills: 0,
    atomicNumServer: 1
  };

  score_array[socket.id] = {
    protonScore: 0,
    electronScore: 0,
    neutronScore: 0,
    id: socket.id
  }


  // send the players object to the new player
  socket.emit('currentPlayers', players);

  // send the proton/electron/neutron object to the new player
  proton.score = score_array;
  electron.score = score_array;
  neutron.score = score_array;

  socket.emit('protonUpdate', proton);
  socket.emit('electronUpdate', electron);
  socket.emit('neutronUpdate', neutron);

  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    delete score_array[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });

  // when a player moves, update the player data
  socket.on('playerMovement', function (movementData) {
    if (typeof players[socket.id] != "undefined") {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      players[socket.id].vy = movementData.vy;
      players[socket.id].vx = movementData.vx;
      players[socket.id].rotation = movementData.rotation;
      // emit a message to all players about the player that moved
      socket.broadcast.emit('playerMoved', players[socket.id]);
    }
  });

  //when protons get collected, this resets its position and increases the score in the entire score array
  socket.on('protonCollected', function () {
    proton.x = Math.floor(Math.random() * 1100) + 50;
    proton.y = Math.floor(Math.random() * 700) + 50;
    if (typeof score_array[socket.id] != "undefined") {
      if (score_array[socket.id].protonScore < 2) {
        score_array[socket.id].protonScore++;
      }

      proton.score = score_array;
    }
    io.emit('protonUpdate', proton);
  });

  //when electrons get collected, this resets its position and increases the score in the entire score array
  socket.on('electronCollected', function () {
    electron.x = Math.floor(Math.random() * 1100) + 50;
    electron.y = Math.floor(Math.random() * 700) + 50;
    if (typeof score_array[socket.id] != "undefined") {
      if (score_array[socket.id].electronScore < 2) {
        score_array[socket.id].electronScore++;
      }
      electron.score = score_array;
    }
    io.emit('electronUpdate', electron);
  });

  //when neutrons get collected, this resets its position and increases the score in the entire score array
  socket.on('neutronCollected', function () {
    neutron.x = Math.floor(Math.random() * 1100) + 50;
    neutron.y = Math.floor(Math.random() * 700) + 50;
    if (typeof score_array[socket.id] != "undefined") {
      if (score_array[socket.id].neutronScore < 2) {
        score_array[socket.id].neutronScore++;
      }
      neutron.score = score_array;
    }
    io.emit('neutronUpdate', neutron);
  });

  //
  socket.on('player-heal', function (data) {
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
  socket.on('shoot-bullet', function (data) {
    if (players[socket.id] == undefined) return;
    let new_bullet = data;
    data.owner_id = socket.id; // Attach id of the player to the bullet 
    bullet_array.push(new_bullet);
  });

  //gets called once a player is ready to upgrade
  socket.on('upgrade', function (atomicNum) {
    if (players[socket.id] != undefined) {
      players[socket.id].atomicNumServer = atomicNum;
      score_array[socket.id].protonScore = 0;
      score_array[socket.id].neutronScore = 0;
      score_array[socket.id].electronScore = 0;

      neutron.score = score_array;
      proton.score = score_array;
      electron.score = score_array;

      socket.broadcast.emit('playerUpgraded', players[socket.id]);
    }
  });

});

// Update the bullets 60 times per frame and send updates 
function ServerGameLoop() {


  for (let i = 0; i < bullet_array.length; i++) {
    let bullet = bullet_array[i];
    if (typeof bullet != "undefined") {
      bullet.x += bullet.speed_x / 50;
      bullet.y += bullet.speed_y / 50;

      // Remove if it goes too far off screen 
      if (bullet.x < -10 || bullet.x > 1200 || bullet.y < -10 || bullet.y > 900) {
        bullet_array.splice(i, 1);
        i--;
      }

      for (let id in players) {
        if (bullet.owner_id != id && typeof players[id] != "undefined") {
          // And your own bullet shouldn't kill you
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