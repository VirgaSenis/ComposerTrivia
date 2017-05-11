function GameController($window, $scope, $http, $timeout, $sce) {
	getQuestion();
	$scope.paused = 'false';

	function getQuestion() {
		$http.get('question')
		.then(function successCallback(response) {
			var data = response.data;

			$scope.choices = data.choices;
			$scope.url = $sce.trustAsResourceUrl(data.url); // Must sanitize url to work
			$scope.score = data.score;

			$scope.isShown = true;
		}, function errorCallback(response) {
			if (response.status == 302) {
				$window.location.href = '#/end';
			} else {
				// handle other exceptions
			}
		});
	}

	$scope.postAnswer = function(answer) {

		$http.post('response', {response: answer})
		.then(function(response) {

			var data = response.data;
			$scope.feedback = data.answer + " " + data.title;
			$scope.paused = 'true';
			$timeout(function() {	// wait 2s, then fade out
				$scope.isShown = false;
				$timeout(function() {

					$scope.feedback = "";
					getQuestion();
					$scope.isShown = true;
				}, 1000);
			}, 1000);

		});
	}
}