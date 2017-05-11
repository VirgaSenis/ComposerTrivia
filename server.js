var path = require('path');
var fs = require('fs');
var session = require('express-session');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session( { secret: 'Something'}));
app.use(express.static('public'));

var google_drive_url = "https://drive.google.com/uc?id=";
var number_of_choices = 6;
var NUMBER_OF_QUESTIONS;

var composers;
var questions;

function loadData() {
	loadComposers();
	loadQuestions();
	NUMBER_OF_QUESTIONS = questions.length;
}

function loadComposers() {
	var pathname = path.join(__dirname + '/public/composers.txt');
	var data = fs.readFileSync(pathname, 'utf8');
	composers = data.split('\r\n');
	composers.splice(-1, 1); 
}

function loadQuestions() {
	var pathname = path.join(__dirname + '/public/questions.json');
	questions = JSON.parse(fs.readFileSync(pathname, 'utf8'));
}

function runServer() {
	app.listen(8080);
	console.log('listening on 127.0.0.1:8080');
}

loadData();
runServer();

function isProfaneWord(word, callback) {
	var url = 'http://www.purgomalum.com/service/containsprofanity?text='+word

	console.log('checking profanity');
	var req = http.get(url, function(res) {
		console.log('Status:' + res.statusCode);

		res.on('data', function(chunk) {
			console.log(chunk.toString('utf8'));
			var isProfane = chunk.toString('utf8');
			callback(isProfane);
		});
	});
}

app.get('/', function(req, res) {
	console.log('request for / receieved.');
	res.sendFile( path.join(__dirname + '/public/home.html') );

});

app.post('/playerName', function(req, res) {
	console.log('request for /init receieved.');

	var playerName = req.body.playerName;
	isProfaneWord(playerName, function(isProfane) {
		if (isProfane == true) {
			console.log('dirty person!');
			res.send({ isProfane: true });
		} else {
			console.log('clean!');	
			req.session.questionNumber = 1;
			req.session.score = 0;
		}
		res.end();
	})
});

app.get('/question', function(req, res) {
	console.log('request for GET /question receieved.');
	var session = req.session;

	console.log(session.questionNumber);

	if (session.questionNumber >= NUMBER_OF_QUESTIONS) {
		console.log('game finished');
		res.status(302).send({ redirect: '#/end'});
	} else {
		var qIndex = session.questionNumber - 1;
		var data = {};
		data.score = session.score + " / " + qIndex;
		data.questionNumber = session.questionNumber;
		data.url = google_drive_url + questions[qIndex+1].id;
		data.choices = getQuestionChoices(qIndex);

		console.log(data.url);
		res.send(data);
	}

	res.end();
}); 

function getQuestionChoices(idx) {
	var choices = [];
	var correctChoice = questions[idx].composer;
	
	// remove correct choice from the composer list
	removeElement(composers, correctChoice);

	// add random composers to the choices, while removing them from 
	// composer list
	for (var i=0; i<number_of_choices; i++) {
		var idx = Math.floor(Math.random() * composers.length);
		choices[i] = composers[idx];
		removeElement(composers, choices[i]);
	}

	// add correct choice at random index
	addAtRandomIndex(choices, correctChoice);

	// re-append removed composers
	composers.concat(choices); 

	return choices;
}

function removeElement(list, item) {
	var idx = list.indexOf(item);
	if (idx != -1) {
		list.splice(idx, 1);
	}
}

function addAtRandomIndex(list, item) {
	var idx = Math.floor(Math.random()*list.length);
	list[idx] = item;
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