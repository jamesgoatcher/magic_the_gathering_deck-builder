var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	firstName: String,
	lastName: String,
	userName: { type: String, unique: true },
	gender: String,
	password: String || Number,
	deck: []
});

module.exports= mongoose.model('User', userSchema);