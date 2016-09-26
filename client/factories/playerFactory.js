app.factory('playerFactory', function($http) {
    var activePlayers = [];

    socket.on('update scoreboard', function(players) {
        activePlayers = players;
    })

    var factory = {};

    factory.index = function(callback) {
        callback(activePlayers)
    }

    return factory;
})
