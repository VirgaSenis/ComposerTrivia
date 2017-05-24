function EndController($scope, $http, $location) {
	getScore();

	function getScore() {
		$http.get('score')
		.then(function success(response) {
			$scope.score = response.data.score;
		}, function error(response) {
			$location.path(response.data.path);
		});
	}

	var playAgain = function() {
		$http.get('init')
		.then(function(response) {
			$location.path(response.data.path);
		});
	}
}