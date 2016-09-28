var express  = require( 'express' ),
path     = require( 'path' ),
root     = __dirname,
port     = process.env.PORT || 8000,
bp       = require('body-parser'),
app      = express(),
players  = [],
boards = {};



app.use( express.static( path.join( root, 'client' )));
app.use( express.static( path.join( root, 'bower_components' )));
app.use(bp.json())

// require('./server/config/db.js');
// require('./server/config/routes.js')(app);

var server = app.listen( port, function() {
  console.log( 'server running on port ${ port }' );
});

var io       = require('socket.io').listen(server)

io.sockets.on('connection', function (socket) {
  var socketId = socket.id;
  console.log(socketId, "connected")

  socket.on('start game', function(name) {
    console.log(socket.id, 'joined the game')
    players.push({id: socket.id, name: name, score: 0, rows: 0})
  })

  socket.on('end game', function(score) {
    console.log(socket.id, 'lost the game with', score, 'points')
    players.splice(players.indexOf(socket.id), 1)
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
      console.log(n, 'lines sent')
      var sender;
      for (var player of players) {
        if (player.id == socket.id) {
          sender = player;
        }
      }
      for (var i = 1; i < n; i++) {
        randomPlayer = players[Math.floor(Math.random()*players.length)]
        while (randomPlayer.id == socketId) {
          randomPlayer = players[Math.floor(Math.random()*players.length)]
        }
        socket.broadcast.to(randomPlayer.id).emit('addLine')
        try {
          console.log(sender.name, "is sending line to", randomPlayer.name)
        }
        catch(err) {
            console.log("ERROR:")
            console.log(err)
        }
      }
    }
  })

  socket.on('disconnect', function() {
    players.splice(players.indexOf(socketId), 1)
    delete boards[socketId]
    console.log(socket.id, 'disconnected')
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
}, 1000)
