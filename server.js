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
    console.log( 'server running on port ${ port }' );
});

var io       = require('socket.io').listen(server)

io.sockets.on('connection', function (socket) {
    console.log("WE ARE USING SOCKETS!");
    console.log(socket.id);

    socket.on('start game', function() {
        console.log(socket.id, 'joined the game')
        players.push({id: socket.id, score: 0})
    })

    socket.on('end game', function(score) {
        console.log(socket.id, 'lost the game with', score, 'points')
        players.splice(players.indexOf(socket.id), 1)
    })

    socket.on('score', function(score) {
        for (var player of players) {
            if (player.id == socket.id) {
                player.score = score;
            }
        }
    })

    socket.on('disconnect', function() {
        players.splice(players.indexOf(socket.id), 1)
        console.log(socket.id, 'disconnected')
    })

    setInterval(function() {
        io.emit('update scoreboard', players)
    }, 1000)

})

// setInterval(function() {
//     console.log(players)
// }, 10000)