// logs:
// heroku logs --app tetromino --source app -t

var express = require( 'express' ),
path        = require( 'path' ),
root        = __dirname,
port        = process.env.PORT || 8000,
bp          = require('body-parser'),
app         = express(),
players     = [],
mongoose    = require('mongoose'),
dbScoreboard;

//
// ROUTING:
//
app.use( express.static( path.join( root, 'client' )));
app.use( express.static( path.join( root, 'bower_components' )));
app.use(bp.json())
// require('./server/config/routes.js')(app);

//
// DATABASE:
//
require('./server/config/db.js');
var HighScore = mongoose.model('HighScore');
HighScore.find({}, function(err, highScores){
  if(err){
    console.log('ERROR RETRIEVING HIGH SCORES:');
    console.log(err);
  } else {
    dbScoreboard = highScores
    console.log(highScores)
  }
})


//
// START THE SERVER
//
var server = app.listen( port, function() {
  console.log( 'server running on port', port );
});

//
// SOCKET.IO
//
var io = require('socket.io').listen(server)

io.sockets.on('connection', function (socket) {
  var socketId = socket.id;
  console.log(socketId, "connected")
  io.emit('updateScoreboard', players)
  io.emit('updateDbScoreboard', dbScoreboard)

  socket.on('start game', function(name) {
    console.log(name, socketId, 'joined the game')
    var newPlayer = {id: socketId, name: name, score: 0, rows: 0}
    console.log(newPlayer)
    players.push(newPlayer)
    console.log(players)
    io.emit('updateActivity', players[players.length - 1].name + " has started a game.")
  })

  socket.on('end game', function(score) {
    for (var player of players) {
      if (player.id == socketId) {
        var endingPlayer = player
      }
    }
    if (endingPlayer){
      io.emit('updateActivity', endingPlayer.name + " has lost with " + endingPlayer.score + " points.")

      // HIGH SCORE MANAGEMENT:
      var temp, temp2;
      for (var i = 0; i < dbScoreboard.length; i++) {
        console.log('\n\n\n LOOP:')
        console.log(i)
        if (dbScoreboard[i].score < endingPlayer.score && !temp) {
          console.log('high score:', endingPlayer.score)
          temp = dbScoreboard[i]
          console.log('\n\n\n TEMP:')
          console.log(temp)
          HighScore.findByIdAndUpdate(dbScoreboard[i]._id, {name: endingPlayer.name, score: endingPlayer.score}, function(err, highScore) {
            if (err) {
              console.log(err)
            }
          })
        }
        if (temp && i < 4) {
          temp2 = dbScoreboard[i+1]
          console.log('\n\n\n')
          console.log(i+1)
          console.log(dbScoreboard[i+1])
          console.log(temp)
          HighScore.findByIdAndUpdate(dbScoreboard[i+1]._id, {name: temp.name, score: temp.score}, function(err, highScore) {
            if (err) {
              console.log(err)
            }
          })
          temp = temp2
        }
      }
      // SEND OUT UPDATED SCORES
      HighScore.find({}, function(err, highScores){
        if(err){
          console.log('ERROR RETRIEVING HIGH SCORES:');
          console.log(err);
        } else {
          dbScoreboard = highScores
          io.emit('updateDbScoreboard', dbScoreboard)
        }
      })

      // REMOVE PLAYER
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

      // HIGH SCORE MANAGEMENT:
      var temp, temp2;
      for (var i = 0; i < dbScoreboard.length; i++) {
        console.log('\n\n\n LOOP:')
        console.log(i)
        if (dbScoreboard[i].score < disconnectingPlayer.score && !temp) {
          console.log('high score:', disconnectingPlayer.score)
          temp = dbScoreboard[i]
          console.log('\n\n\n TEMP:')
          console.log(temp)
          HighScore.findByIdAndUpdate(dbScoreboard[i]._id, {name: disconnectingPlayer.name, score: disconnectingPlayer.score}, function(err, highScore) {
            if (err) {
              console.log(err)
            } else {
              highScore.save()
            }
          })
        }
        if (temp && i < 4) {
          temp2 = dbScoreboard[i+1]
          console.log('\n\n\n')
          console.log(i+1)
          console.log(dbScoreboard[i+1])
          console.log(temp)
          HighScore.findByIdAndUpdate(dbScoreboard[i+1]._id, {name: temp.name, score: temp.score}, function(err, highScore) {
            if (err) {
              console.log(err)
            } else {
              highScore.save()
            }
          })
          temp = temp2
        }
      }
      // SEND OUT UPDATED SCORES
      HighScore.find({}, function(err, highScores){
        if(err){
          console.log('ERROR RETRIEVING HIGH SCORES:');
          console.log(err);
        } else {
          dbScoreboard = highScores
          io.emit('updateDbScoreboard', dbScoreboard)
        }
      })

      // remove disconnecting player
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
  // console.log(players)
}, 1000)
