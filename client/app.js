Vue.use(VueSocketio, 'localhost:8000')

var app = new Vue({
	el: '#tetris',
	data: {
		name: '',
		players: []
	},
	computed: {
		sortedPlayers: function() {
			return this.players.sort(function(a, b) {
				if (a.score < b.score) { return 1 }
				if (a.score > b.score) { return -1 }
				return 0
			})
		}
	},
	sockets: {
		connect: function() {},
		updateScoreboard: function(activePlayers) {
			this.players = activePlayers
			// console.log(this.players)
		}
	}
})

app.name = prompt("Please enter your name")
