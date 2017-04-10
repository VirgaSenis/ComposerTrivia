var path = require('path');
var fs = require('fs');
var session = require('express-session');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var CHOICE_CARDINALITY = 6;
var NUMBER_OF_QUESTIONS = 10;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session( { secret: 'Something'}));
app.use(express.static('public'));


function getComposers() {
	var data = fs.readFileSync('./public/composers.txt', 'utf8');
	var list = data.split('\r\n');
	list.splice(-1, 1); 
	return list;
}
var composers = getComposers();
var questions = JSON.parse(fs.readFileSync('./public/questions.json', 'utf8'));

app.listen(8080);


app.get('/', function(req, res) {
	console.log('request for / receieved.');
	res.sendFile( path.join(__dirname + '/public/home.html') );
});

app.get('/init', function(req, res) {
	console.log('request for /init receieved.');

	req.session.questionNumber = 1;
	req.session.score = 0;
	res.send('ok');
});

app.get('/question', function(req, res) {
	console.log('request for GET /question receieved.');
	console.log(req.session);

	var data = {};
	data.score = req.session.score;
	data.numberOfQuestions = NUMBER_OF_QUESTIONS;

	console.log(questions);

	var questionIndex = req.session.questionNumber - 1;
	if (questionIndex == NUMBER_OF_QUESTIONS) {
		data.isFinished = true;

		res.send(data);

	} else {
		data.url = questions[questionIndex].link;
		data.choices = makeQuestionChoices(questionIndex);
		res.send(data);
	}

	res.end();
}); 

function makeQuestionChoices(questionIndex) {
	var choices = [];
	insertAnswer(choices, questionIndex);
	insertWrongChoices(choices);
	return choices;
}

function insertAnswer(choices, questionIndex) {
	var answer = questions[questionIndex].composer;
	questionIndex = Math.round(Math.random() * (CHOICE_CARDINALITY-1) );
	choices[questionIndex] = answer;
}

function insertWrongChoices(choices) {
	for (var i=0; i<CHOICE_CARDINALITY; i++) {
		while (choices[i] === undefined || choices[i] === null) {
			var j = Math.round(Math.random() * composers.length);
			var composer = composers[j];

			if (choices.indexOf(composer) == -1) {
				choices[i] = composers[j];
			}
		} 
	}

	return choices;
}

app.post('/response', function(req, res) {
	console.log('request for POST /answer received.');

	var questionIndex = req.session.questionNumber - 1;
	req.session.questionNumber++;

	var data = {};
	data.title = questions[questionIndex].title;

	if (req.body.response == questions[questionIndex].composer) {
		req.session.score++;

		data.answer = true;
		res.send(data);
	} else {
		data.answer = false;
		data.composer = questions[questionIndex].composer;
		res.send(data);
	}
});