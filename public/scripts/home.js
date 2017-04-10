var app = angular.module('myApp', ['ngRoute','ngAnimate']);

app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'partials/main.htm',
			controller: 'MainController'
		})
		.when('/play', {
			templateUrl: 'partials/game.htm',
			controller: 'GameController'
		})
		.otherwise({ redirectTo: '/' });
});


var controllers = {};

controllers.MainController = function($scope, $http) {
	$http.get('init');
}

controllers.GameController = function($scope, $http, $timeout) {
	getQuestion();
	
	function getQuestion() {
		$http.get('question')
		.then(function(response) {
			var data = response.data;
			if (data.isFinished == true) {
				$scope.feedback = "Thanks for playing!";
			} else {
				$scope.choices = data.choices;
				$scope.url = data.url;	
				$scope.score = data.score;
				$scope.numberOfQuestions = data.numberOfQuestions;
			}

			$scope.isShown = true;
		});
	}


	$scope.postAnswer = function(answer) {
		$http.post('response', {response: answer})
		.then(function(response) {

			var data = response.data;
			$scope.feedback = data.answer + " " + data.title;

			$timeout(function() {
				$scope.isShown = false;
				$timeout(function() {
					$scope.feedback = "";
					getQuestion();
					$scope.isShown = true;
				}, 2000);
			}, 2000);

		});
	}
}

app.controller(controllers);