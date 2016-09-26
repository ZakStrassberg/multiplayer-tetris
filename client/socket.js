var socket = io();
var scores = document.getElementById('scores')
console.log(scores)

socket.on('update scoreboard', function(players) {
    scoreboard = '';
    for (player of players) {
        scoreboard += "<tr><td>"+player.id+"</td><td>"+player.score+"</td></tr>"
    }
    scores.innerHTML = scoreboard
})
