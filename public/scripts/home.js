function HomeController($scope, $http, $window, $location) {
	console.log('MainController');
	
	$scope.$watch('playerName', function(value) {
		$scope.feedback = '';
		$scope.glyphicon = '';
	});

	$scope.post = function() {
		$http.post('playerName', { playerName: $scope.playerName })
		.then(function successCallback(response) {
			console.log(response.data);
			if (response.data.isProfane == true) {
				$scope.feedback = 'has-error';
				$scope.glyphicon = 'glyphicon-remove';
				$scope.message = 'No profanity please!';
			} else {
				// $window.location.href = '#/play';
				$location.url('/play');
			}
		}, function errorCallback(response) {

		});
	}
}	