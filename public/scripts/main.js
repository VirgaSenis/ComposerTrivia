var app = angular.module('myApp', ['ngRoute','ngAnimate','ngSanitize']);

app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'partials/home.htm',
			controller: 'HomeController'
		})
		.when('/play', {
			templateUrl: 'partials/game.htm',
			controller: 'GameController'
		})
		.when('/end', {
			templateUrl: 'partials/end.htm',
			// controller: 'EndController'
		})
		.otherwise({ redirectTo: '/' });
});

app.controller({
	'GameController': GameController,
	'HomeController': HomeController
});

app.directive('pauseAudio', function() {
	function link(scope, element, attrs) {
		scope.$watch(attrs.pauseAudio, function(value) {
			console.log('within directive: ' + value);
			if (value == 'true') {
				element[0].pause();
			} else if (value == 'false') {
				element[0].play();
			}
		});
	}

	return {
		link: link
	};
});

