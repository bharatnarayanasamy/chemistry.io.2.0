let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(8083, () => {
  console.log(`Listening on ${server.address().port}`);
});

var players = {};
var bullet_array = [];
var score_array = {};
var healthInfo = {
  id: 0,
  i: 0
}

var socketID;

var proton = {
  x: Math.floor(Math.random() * 1100) + 50,
  y: Math.floor(Math.random() * 700) + 50,
};
var electron = {
  x: Math.floor(Math.random() * 1100) + 50,
  y: Math.floor(Math.random() * 700) + 50,
};
var neutron = {
  x: Math.floor(Math.random() * 1100) + 50,
  y: Math.floor(Math.random() * 700) + 50,
};
var data = {
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
    rotation: 0,
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'green' : 'blue',
    health: 100,
    kills: 0,
    atomicNumServer: 1
  };

  score_array[socket.id] = {
    protonScore: 1,
    electronScore: 1,
    neutronScore: 1,
    id: socket.id
  }


  // send the players object to the new player
  socket.emit('currentPlayers', players);

  // send the proton/electron/neutron object to the new player
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
      players[socket.id].rotation = movementData.rotation;
      // emit a message to all players about the player that moved
      socket.broadcast.emit('playerMoved', players[socket.id]);
    }
  });

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

  socket.on('protonCollected', function () {
    proton.x = Math.floor(Math.random() * 1100) + 50;
    proton.y = Math.floor(Math.random() * 700) + 50;

    score_array[socket.id].protonScore++;
    proton.score = score_array;

    io.emit('protonUpdate', proton);
  });

  socket.on('electronCollected', function () {
    electron.x = Math.floor(Math.random() * 1100) + 50;
    electron.y = Math.floor(Math.random() * 700) + 50;
    score_array[socket.id].electronScore++;
    electron.score = score_array;


    io.emit('electronUpdate', electron);
  });

  socket.on('neutronCollected', function () {
    if (typeof score_array[socket.id] == "undefined") return;

    neutron.x = Math.floor(Math.random() * 1100) + 50;
    neutron.y = Math.floor(Math.random() * 700) + 50;
    score_array[socket.id].neutronScore++;
    neutron.score = score_array;

    io.emit('neutronUpdate', neutron);
  });

  // Listen for shoot-bullet events and add it to our bullet array
  socket.on('shoot-bullet', function (data) {
    if (players[socket.id] == undefined) return;
    var new_bullet = data;
    data.owner_id = socket.id; // Attach id of the player to the bullet 
    bullet_array.push(new_bullet);
  });

  socket.on('upgrade', function (atomicNum) {
    players[socket.id].atomicNumServer = atomicNum;
    socket.broadcast.emit('playerUpgraded', players[socket.id]);
  });
  

});

/*
  socket.on('timeUpdate', function(time){
    io.emit('newTime', time);
  })
  */


// Update the bullets 60 times per frame and send updates 
function ServerGameLoop() {

  
  for (var i = 0; i < bullet_array.length; i++) {
    var bullet = bullet_array[i];
    if (typeof bullet != "undefined") {

      bullet.x += bullet.speed_x / 50;
      bullet.y += bullet.speed_y / 50;

      // Remove if it goes too far off screen 
      if (bullet.x < -10 || bullet.x > 1200 || bullet.y < -10 || bullet.y > 900) {
        bullet_array.splice(i, 1);
        i--;
      }

      for (var id in players) {
        if (bullet.owner_id != id) {
          // And your own bullet shouldn't kill you
          var dx = players[id].x - bullet.x;
          var dy = players[id].y - bullet.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var owner = bullet.owner_id;
          if (dist < 70) {
            healthInfo.i = i;
            healthInfo.id = id;
            io.emit('player-hit', healthInfo); // Tell everyone this player got hit
            players[id].health -= bullet.damage;
            bullet_array.splice(i, 1);
            i--;
          }
          io.emit("update-health", players[id]);

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

  // Tell everyone where all the bullets are by sending the whole array
  io.emit("bullets-update", bullet_array);
}

setInterval(ServerGameLoop, 16);



