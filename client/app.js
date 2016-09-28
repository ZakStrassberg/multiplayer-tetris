Vue.use(VueSocketio, 'localhost:8000')

var tetris = new Vue({
	el: '#tetris',
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

var boards = new Vue({
	el: '#boards',
	data: {
		boards: []
	},
	sockets: {
		connect: function() {},
		sendBoards: function(activeBoards) {
			this.boards = activeBoards
		}
	}
})
