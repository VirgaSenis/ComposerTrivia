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
			controller: 'EndController'
		})
		.otherwise({ redirectTo: '/' });
});

app.directive('pauseAudio', pauseAudio);

app.controller({
	'GameController': GameController,
	'HomeController': HomeController,
	'EndController': EndController
});

app.controller('BackgroundController', function($scope, $window, $location) {
	
	$scope.$on('$locationChangeSuccess', function(event) {
		console.log('path='+$location.url());
		if ($location.url() == '/') {
			$scope.bgTheme = 'home-bg';
		} else {
			$scope.bgTheme = 'other-bg';
		}
	});
});