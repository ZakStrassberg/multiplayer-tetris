// logs:
// heroku logs --app tetromino --source app -t

var express  = require( 'express' ),
path     = require( 'path' ),
root     = __dirname,
port     = process.env.PORT || 8000,
bp       = require('body-parser'),
app      = express(),
players  = [];



app.use( express.static( path.join( root, 'client' )));
app.use( express.static( path.join( root, 'bower_components' )));
app.use(bp.json())

// require('./server/config/db.js');
// require('./server/config/routes.js')(app);

var server = app.listen( port, function() {
  console.log( 'server running on port', port );
});

var io = require('socket.io').listen(server)

io.sockets.on('connection', function (socket) {
  var socketId = socket.id;
  console.log(socketId, "connected")

  socket.on('start game', function(name) {
    console.log(name, socketId, 'joined the game')
    players.push({id: socketId, name: name, score: 0, rows: 0})
    io.emit('updateActivity', players[players.length].name + " has started a game.")
  })

  socket.on('end game', function(score) {
    for (var player of players) {
      if (player.id == socketId) {
        var endingPlayer = player
      }
    }
    if (endingPlayer){
      io.emit('updateActivity', endingPlayer.name + " has lost with " + endingPlayer.score + " points.")
      players.splice(players.indexOf(endingPlayer), 1)
    } else {
      console.log("something went wrong. a player left but I couldn't find them.")
    }
  })

  socket.on('score', function(score) {
    for (var player of players) {
      if (player.id == socketId) {
        player.score = score;
      }
    }
  })

  socket.on('row', function(rows) {
    for (var player of players) {
      if (player.id == socket.id) {
        player.rows = rows;
      }
    }
  })

  socket.on('sendLines', function(n) {
    if (players.length > 1) {
      console.log(n, 'lines being sent:')
      var sender;
      for (var player of players) {
        if (player.id == socket.id) {
          sender = player;
        }
      }
      if (sender) {
        for (var i = 1; i < n; i++) {
          randomPlayer = players[Math.floor(Math.random()*players.length)]
          var maxTries = 5;
          // prevent from sending line to self:
          while (randomPlayer.id == socketId && maxTries > 0) {
            randomPlayer = players[Math.floor(Math.random()*players.length)]
            maxTries--
          }
          socket.broadcast.to(randomPlayer.id).emit('addLine')
          try {
            io.emit('updateActivity', sender.name + " has sent a line to " + randomPlayer.name)
          }
          catch(err) {
            console.log("ERROR:")
            console.log(err)
          }
        }
      }
    }
  })

  socket.on('disconnect', function() {
    for (var player of players) {
      if (player.id == socketId) {
        var disconnectingPlayer = player
      }
    }
    if (disconnectingPlayer){
      io.emit('updateActivity', disconnectingPlayer.name + " has disconnected.")
      console.log(socket.id, 'disconnected')
      players.splice(players.indexOf(disconnectingPlayer), 1)
    }
  })

  socket.on('boardImage', function(image) {
    for (var player of players) {
      if (player.id == socketId) {
        player.board = image;
      }
    }
  })
})

setInterval(function() {
  io.emit('updateScoreboard', players)
  console.log(players)
}, 1000)
