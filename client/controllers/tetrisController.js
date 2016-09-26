app.controller('tetrisController', function($scope, playerFactory) {
    $scope.players = [];

    playerFactory.index(function(data) {
        $scope.players = data;
    })

    setInterval(function() {
        console.log($scope.players)
    }, 1000)
})
