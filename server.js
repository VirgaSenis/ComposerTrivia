var path = require('path');
var fs = require('fs');
var session = require('express-session');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session( { secret: 'Something',
				   saveUninitialized: true}));
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
	var pathname = path.join(process.cwd() + '/composers.txt');
	console.log(pathname);
	var data = fs.readFileSync(pathname, 'utf8');
	composers = data.split('\r\n');
	composers.splice(-1, 1);
	console.log('initialComposersLength'+composers.length); 
}

function loadQuestions() {
	var pathname = path.join(__dirname + '/questions.json');
	console.log(pathname);
	questions = JSON.parse(fs.readFileSync(pathname, 'utf8'));
}

loadData();
app.listen(app.get('port'));

function isProfaneWord(word, callback) {
	var url = 'http://www.purgomalum.com/service/containsprofanity?text='+word

	console.log('checking profanity');
	var req = http.get(url, function(res) {
		console.log('Status:' + res.statusCode);

		res.on('data', function(chunk) {
			var isProfane = chunk.toString('utf8');
			
			callback(isProfane);
		});
	});
}

app.get('/', function(req, res) {
	console.log('GET / requested.');
	res.sendFile( path.join(__dirname + '/public/index.html') );

});

app.post('/user', function(req, res) {
	console.log('POST /user requested.');
	var user = req.body;

	isProfaneWord(user.name, function(isProfane) {
		var data = {};
		data.isAvailable = (isProfane == 'true') ? false : true;
		if (isProfane == 'false') {
			req.session.username = user.name;
		}

		res.send(data);
		res.end();
	})
});

app.get('/init', function(req, res) {
	console.log('GET /init requested.');
	var session = req.session;

	session.questionNumber = 1;
	session.score = 0;

	res.send({ path: '/play'});
	res.end();
});

app.get('/question', function(req, res) {
	console.log('request for GET /question receieved.');
	var session = req.session;

	console.log(session.questionNumber);

	if (session.questionNumber == undefined) {
		console.log('redirecting..');
		res.status(303).send({ path: '/' });
	} else if (session.questionNumber > NUMBER_OF_QUESTIONS) {
		console.log('game finished');
		res.status(303).send({ path: '/end'});
	} else {
		var qIndex = session.questionNumber - 1;
		var data = {};

		data.username = session.username;
		data.questionNumber = session.questionNumber;
		data.score = session.score + "/" + qIndex;
		data.questionNumber = session.questionNumber;
		data.url = google_drive_url + questions[qIndex].id;
		data.choices = getQuestionChoices(qIndex);

		console.log(data.choices);
		res.send(data);
		console.log('composersLength='+composers.length);
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
	var poppedItem = addAtRandomIndex(choices, correctChoice);
	composers.push(poppedItem);

	// re-append removed composers
	composers = composers.concat(choices); 

	return choices;
}

function removeElement(list, str) {
	var idx = findIndex(list, str);
	if (idx != -1) {
		list.splice(idx, 1);
	}
}

function findIndex(list, str) {
	var pattern = new RegExp(str, 'i');
	for (var i=0; i<list.length; i++) {
		if (pattern.test(list[i]) == true) {
			return i;
		}
	}

	return -1;
}

function addAtRandomIndex(list, item) {
	var idx = Math.floor(Math.random()*list.length);
	var poppedItem = list[idx];
	list[idx] = item;
	return poppedItem;
}


app.post('/answer', function(req, res) {
	console.log('request for POST /answer received.');

	var qIndex = req.session.questionNumber - 1;
	

	var data = {};
	data.title = questions[qIndex].title;
	data.composer = questions[qIndex].composer;
	data.isCorrect = (req.body.answer == data.composer);

	if (data.isCorrect) {
		req.session.score++;
	}

	req.session.questionNumber++;

	res.send(data);
	res.end();
});

app.get('/score', function(req, res) {
	console.log('GET /score requested.');

	if (req.session.score == undefined) {
		res.status(303).send({path: '/'})
	}
	
	res.send({ score: req.session.score + '/' + NUMBER_OF_QUESTIONS });
});