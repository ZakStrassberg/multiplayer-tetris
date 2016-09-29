Vue.use(VueSocketio, 'tetromino.herokuapp.com')

var tetris = new Vue({
	el: '#app',
	data: {
		name: '',
		players: [],
		messages: []
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
		},
		updateActivity: function(message) { //george
			this.messages.unshift(message)
			if (messages.length > 4) {
				console.log(messages.length)
				messages.splice(4)
			}
			// console.log(this.players)
		}
	}
})
