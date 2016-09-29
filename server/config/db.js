password        = process.env.mongoPassword

var mongoose = require('mongoose');

mongoose.connect('mongodb://tetris:' + password + '@ds047166.mlab.com:47166/tetrishighscores', function(err) {
	if (err) {
		return console.error(err)
	}
});

var HighScoreSchema = new mongoose.Schema({
    name: String,
    score: Number
});

mongoose.model('HighScore', HighScoreSchema);
