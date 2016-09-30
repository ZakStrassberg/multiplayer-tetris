Vue.use(VueSocketio, 'tetromino.herokuapp.com')

var tetris = new Vue({
	el: '#app',
	data: {
		name: '',
		players: [],
		messages: [],
		highScores: [],
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
		connect: function() {
			this.socketId = '/#'+this.$socket.id
		},
		updateScoreboard: function(activePlayers) {
			this.players = activePlayers
		},
		updateActivity: function(message) { //george
			this.messages.unshift(message)
			while (this.messages.length > 6) {
				this.messages.pop()
			}
		},
		updateDbScoreboard: function(highScores) {
			this.highScores = highScores
		}
	},
	methods: {
		hideModal: function() {
			jQuery('#name-modal').modal('hide')
		}
	}
})
