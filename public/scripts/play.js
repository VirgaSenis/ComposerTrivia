function GameController($window, $location, $scope, $http, $sce) {
	
	getQuestion();
	
	function getQuestion() {
		$http.get('question')
		.then(function successCallback(response) {
			var data = response.data;

			if (data.username.length > 8 && $window.innerWidth < 768) {
				$scope.username = data.username.substr(0, 6) + "..";
			} else {
				$scope.username = data.username;
			}
			
			$scope.questionNumber = data.questionNumber;
			$scope.choices = data.choices;
			$scope.url = $sce.trustAsResourceUrl(data.url); // Must sanitize url to work
			$scope.score = data.score;
			

		}, function errorCallback(response) {
			if (response.status == 303) {
				$location.path(response.data.path);
			}
		});
	}

	$scope.postAnswer = function(answer) {
		$scope.hasAnswered = true;
		$http.post('answer', {'answer': answer})
		.then(function(response) {
			var data = response.data;
			if (data.isCorrect == true) {
				playCorrectSound();
			} else {
				playIncorrectSound();
			}

			$scope.userAnswer = answer;
			$scope.composer = data.composer;
		});
		
	}

	function playCorrectSound() {
		var audio = new Audio('../audio/correct.wav');
		audio.play();
	}

	function playIncorrectSound() {
		(new Audio('../audio/incorrect.wav')).play();
	}

	// called by ng-class; return true if the choice is correct answer.
	$scope.isCorrectChoice = function(choice) {
		return choice == $scope.composer;
	}

	// called by ng-class; return true if the user chose the choice
	// and it is incorrect answer.
	$scope.isIncorrectChoice = function(choice) {
		return choice == $scope.userAnswer && choice != $scope.composer;
	}

	$scope.goNext = function() {
		$scope.composer = null;
		$scope.userAnswer = null;
		getQuestion();
		$scope.hasAnswered = false;
	}
}

// directive to pause audio when user answers.
function pauseAudio() {
	function link(scope, element, attrs) {
		scope.$watch(attrs.pauseAudio, function(hasAnswered) {
			if (hasAnswered == true) {
				element[0].pause();
			} else if (hasAnswered == false) {
				element[0].play();
			}
		});
	}

	return {
		link: link
	};
}