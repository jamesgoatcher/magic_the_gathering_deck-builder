var app = angular.module('MagicDeckApp', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode({enabled:true});

	$routeProvider.when('/', {
		templateUrl: 'partials/home.html'
	}).when('/signup', {
		templateUrl: 'partials/signup.html',
		controller: 'SignUp',
		controllerAs: 'submit'
	}).when('/search', {
		templateUrl: 'partials/search.html',
		controller: 'Search',
		controllerAs: 'search'
	}).when('/search/:searchColor', {
		templateUrl: 'partials/search.html',
		controller: 'Search',
		controllerAs: 'search'
	}).when('/login', {
		templateUrl: 'partials/login.html',
		controller: 'LogIn',
		controllerAs: 'login'
	}).when('/show/:cardid/:color', {
		templateUrl: 'partials/show.html',
		controller: 'Show',
		controllerAs: 'show'
	}).when('/users/:id', {
		templateUrl: 'partials/users.html'
	}).when('/logout', {
		templateUrl: 'partials/logout.html',
		controller: 'LogOut',
		controllerAs: 'logout'
	});
}]);

//PARENT CONTROLLER
app.controller('Index', ['$http', '$scope', function($http, $scope) {
	console.log('this is the index page');
	var index = this;

	//Silly JS message if User attempts sign up with already registered name
	this.randomNames = ['myLittleBrony', 'BubbleButt1986', 'KakaoFriends119', 'Cicada3301', 'JetFuelSteelBeams'];
	this.randomName = function() {
		return index.randomNames[Math.floor(Math.random()*5)];
	}

	//Controls nav bar and front-end user view: True = no user, False = user
	$scope.noUser = true;
	//Controls empty deck message.  False = no cards, True = cards
	$scope.deckEmpty = false;

	//Transmits cards to parent
	$scope.$on('showCard', function(event, data){
		// console.log(data);
		index.cards = data.cards;
		$scope.cards = index.cards;
	});

	//Transmits color to parent
	$scope.$on('reportColor', function(event, data){
		// console.log(data.searchColor);
		$scope.searchColor = data.searchColor;
	});

	//Transmits logged in user info to parent
	$scope.$on('getUser', function(event, data){ 
		index.user = data.userLogged;
		$scope.user = index.user;
	
		if ($scope.user.userName !== undefined) { //nav bar links, w/o final suffix = bad PW return user profile
			index.navVar = 'WELCOME, ' + index.user.userName;
			index.navLink = '/users/{{index.user._id}}';
			$scope.noUser = false;
		};

		if(index.user.gender == 'male') { //changes User's avatar based on gender declaration
			index.userImage = '../img/user-m.jpg';
		} else if(index.user.gender == 'female') {
			index.userImage = '../img/user-f.jpg';
		} else {
			index.userImage = '../img/user-p.jpg';
		};

		//Deck is empty message
		//BUGGGGGGGGG needs digest cycle to run
		if(index.user.deck.length >= 1) {
			$scope.deckEmpty = true;
		};

	});

}]);

//Sign Up
app.controller('SignUp', ['$http', '$scope', '$location', '$window', function($http, $scope, $location, $window) {
	console.log('this is the sign up page');
	$scope.badPassword = false;

	this.signUp = function() {
		console.log('Adding a new Planeswalker to the annals of our history');
		// console.log('Planeswalker\'s data: ', this.form);

		$http({
			method: 'POST',
			url: '/users',
			data: this.form
		}).then(function(result){
			// console.log(result)
			if(result.data !== ""){
				console.log(result.data);
				userLogged = result.data;
				$scope.$emit('getUser', {
					userLogged: userLogged
			});
				console.log('Welcome Planeswalker')
				$location.url('/users/'+userLogged._id);
			} else {
				// console.log('Username already exists pls try again')
				console.log('I\'m sorry Planeswalker but that name is already in use, please try again, we wouldn\'t want identity theft would we?')
				$scope.badPassword = true;
			}
		});
	}
}]);

//Log In
app.controller('LogIn', ['$http', '$scope', '$location', '$route', function($http, $scope, $location, $route) {
	console.log('this is the log in page');

	$scope.badPassword = false;

	this.logIn = function() {
		console.log('a Planeswalker is logging in!');
		// console.log('Planeswalker\'s data: ', this.form);

		$http({
			method: 'POST',
			url: '/users/login',
			data: this.form
		}).then(function(result){
			// console.log(result.data);
			if (result.data !== 'failed'){
				userLogged = result.data;
				$scope.$emit('getUser', {
					userLogged: userLogged
				});
				console.log('redirecting to your user page');
				$location.url('/users/'+userLogged._id);
			}else {
				console.log('you typed the wrong password buddy')
				$scope.badPassword = true;
			}
		});
	}
}]);

//Log Out
app.controller('LogOut', ['$http', '$scope', '$location', '$route', function($http, $scope, $location, $route) {
	console.log('this is the log out page');

	this.logOut = function() {
		console.log('a Planeswalker is logging in!');
		// console.log('Planeswalker\'s data: ', this.form);

		$http({
			method: 'POST',
			url: '/users/logout',
			data: this.form
		}).then(function(result){
			console.log(result);
			userLogged = null;
			$scope.$emit('getUser', {
				userLogged: userLogged
			});
			$scope.$parent.noUser = true;
			console.log('redirecting to home');
			// $location.url('/');
			location.reload();
		});
	}
	
}]);

//Search for cards
app.controller('Search', ['$http', '$scope', '$routeParams', function($http, $scope, $routeParams) {
	console.log('this is the search page');
	var search = this;
	this.searched = false;

	//find card by color function
	this.find = function(color) {
		console.log('patience Walker looking into your request');
		$scope.searchColor = color;
		$scope.$emit('reportColor', {
            	searchColor: color
        });
		console.log($scope.searchColor);

		$http({
			method: 'GET',
			url: 'https://api.magicthegathering.io/v1/cards?colors='+color+'&pageSize=500',
		}).then(function(result){
			// console.log(result.data.cards);
			search.cards = result.data.cards;
			$scope.$emit('showCard', {
            	cards:search.cards
        	});
		})
		search.searched=true;
	};

	if ($routeParams.searchColor !== undefined){
		search.find($routeParams.searchColor)
	};

	//Toggles search glyph's static CSS change
	$('.glyphicon-class').click(function() {
		$('.glyphicon-class').not(this).removeClass('glyphicon-active');
		$(this).toggleClass('glyphicon-active');
	});

	//Load more
	$scope.limit = 15;

}]);

//Show page for card
app.controller('Show', ['$http', '$scope', '$routeParams', '$filter', '$location', function($http, $scope, $routeParams, $filter, $location) {
	console.log('this is the show page');
	var show = this;
	show.fromDeck = false;
	show.noUser = $scope.noUser;
	console.log($scope.noUser);
	$routeParams.color = $routeParams.color.toLowerCase()
	// console.log($routeParams.color);

	//debugging console.logs to figure out why my new if conditions weren't working
	//turns out it was because I was calling $routeParams instead of $routeParams.color
	// console.log('checking if statement conditions:')
	// console.log('=======================')
	// console.log('$scope.$parent.cards: ')
	// console.log($scope.$parent.cards)
	// console.log('=======================')
	// console.log('$routeParams: ')
	// console.log($routeParams)
	// console.log('=======================')
	// console.log('$scope.searchColor: ')
	// console.log($scope.searchColor)
	// console.log($routeParams.color !== $scope.searchColor)

	//checks to see where user is coming from
	//also checks to see where it should be getting the data from the if is for data that should be
	//gotten from db else is for data from json from api request
	if (($scope.$parent.cards === undefined) || ($routeParams.color !== $scope.searchColor)){
		console.log('undefined going another direction');
		// console.log($scope.user._id);
		var userId = $scope.user._id;
		$http({
			method:'GET',
			url:'/users/deck/'+userId
		}).then(function(result){
			// console.log(result.data)
			show.card = $filter('filter')(result.data, function (card) {return card.id === $routeParams.cardid;})[0];
			console.log(show.noUser);
			show.fromDeck = true;
			console.log(show.fromDeck);
		})
	} else {
		console.log(show.noUser);
		console.log(show.fromDeck);
		console.log('showing card from json')
		show.card = $filter('filter')($scope.$parent.cards, function (card) {return card.id === $routeParams.cardid;})[0];
	}

	//function to add a card from the search to your deck
	this.addCard = function(){
		$http({
			method:'POST',
			url: '/users/deck',
			data: show.card
		}).then(function(result){
			console.log('added card');
			console.log(result.data);
			console.log($scope.user)
			$scope.user.deck = result.data;
			$location.url('/users/'+$scope.user._id);
		})
	}
}]);

//Sub-controller for ABOUT section's ng-includes
app.controller('HomeController', function() {

	this.include_what = 'partials/what.html';
	this.include_who  = 'partials/who.html';
	this.include_how  = 'partials/how.html';

	this.switchAboutWhat = function() {
		this.include_about = '';
		this.include_about = 'partials/what.html';
	};

	this.switchAboutWho = function() {
		this.include_about = '';
		this.include_about = 'partials/who.html'
	};

	this.switchAboutHow = function() {
		this.include_about = '';
		this.include_about = 'partials/how.html'
	};

});