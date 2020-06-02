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

io.on('connection', function (socket) {
  console.log('a user connected');
  // create a new player and add it to our players object
  players[socket.id] = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    rotation: 0,
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
  };
  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);
  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    console.log(players);
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });
  // when a player moves, update the player data
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });

  // Listen for shoot-bullet events and add it to our bullet array
  socket.on('shoot-bullet',function(data){
    if(players[socket.id] == undefined) return;
    var new_bullet = data;
    data.owner_id = socket.id; // Attach id of the player to the bullet 
    bullet_array.push(new_bullet);
  });
});

// Update the bullets 60 times per frame and send updates 
function ServerGameLoop(){
  for(var i=0;i<bullet_array.length;i++){
    var bullet = bullet_array[i];
    bullet.x += bullet.speed_x/50; 
    bullet.y += bullet.speed_y/50; 
    
    // Remove if it goes too far off screen 
    if(bullet.x < -10 || bullet.x > 1200 || bullet.y < -10 || bullet.y > 900){
        bullet_array.splice(i,1);
        i--;
    }
        
  }
  // Tell everyone where all the bullets are by sending the whole array
  io.emit("bullets-update",bullet_array);
}

setInterval(ServerGameLoop, 16); 





