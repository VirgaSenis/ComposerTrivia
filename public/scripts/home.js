function HomeController($scope, $http, $window, $location) {
	console.log('MainController');

	$scope.playGame = function() {
		if ($scope.userForm.$valid == true) {
			$http.get('/init')
			.then(function() {
				$location.url('/play');
			});
		}
	}

	$scope.isAvailable = function() {
		$scope.userForm.userName.$setValidity('', false);	// set false until validated

		$http.post('user', { name: $scope.user.name })
		.then(function(response) {
			if (response.data.isAvailable == false) {
				$scope.feedback = 'has-error';
				$scope.errorMessage = 'No profanity please!';
				$scope.userForm.userName.$setValidity('', false);
			} else {
				var isEmpty = $scope.userForm.userName.$error.required;
				$scope.feedback = (isEmpty == true) ? 'has-warning' : 'has-success';
				$scope.message = '';
				$scope.userForm.userName.$setValidity('', true);
			}
		});		
	}

	$scope.cancel = function(event) {
		if (event.keyCode == 27) { // 27 is code for ESC key
			$scope.playForm.playerName.$rollbackViewValue();
		}
	}
}	