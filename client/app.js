Vue.use(VueSocketio, 'tetromino.herokuapp.com')

var tetris = new Vue({
	el: '#container',
	data: {
		name: '',
		players: [],
		socketId: ''
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
