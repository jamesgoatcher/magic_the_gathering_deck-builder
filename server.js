//API key hidden (we don't have one but it's nice to have documentation)
require('dotenv').config();

//Server variables
var express = require('express'),
    app     = express(),
    mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    session = require('express-session'),
    bodyParser = require('body-parser');

//Sessions for user cookies
app.use(session({
    secret: "Planeswalker",
    resave: false,
    saveUninitialized: false
}));

var port = process.env.PORT || 3000;
var mongoDBURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mtgmeanapp';

mongoose.connect(mongoDBURI);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//public files :D
app.use(express.static('public'));

//controller info here!
var usersController = require('./controllers/usersController');
app.use('/users', usersController);

//Catch all redirect
app.get('*', function(req, res){
  res.redirect('/');
});

mongoose.connection.once('open', function(){
    console.log('greetings Planeswalker I await your command');
})

//Port
app.listen(port, function(){
    console.log('hush a Planeswalker is among us');
    console.log(process.env.HELLO)
})
