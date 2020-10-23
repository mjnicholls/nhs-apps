// requires session within the env file
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

var express = require('express');
var app = express();
var path = require('path');
var bcrypt = require('bcrypt');
var passport = require('passport');
var session = require('express-session');
var flash = require('express-flash');
var initializePassport = require('./passport-config');
var bodyparser = require('body-parser');
var methodOverride = require('method-override');

app.set("view engine", "ejs");
app.engine('html', require('ejs').renderFile);

// GLOBAL VARIABLES
var allUsers;

var url =
	'mongodb+srv://gccnhsapp:gccnhsapp@cluster0-7jkvi.mongodb.net/test?retryWrites=true&w=majority';
var MongoClient = require('mongodb').MongoClient;

// CREATE BODY PARSER APPLICATION
var urlencodedParser = bodyparser.urlencoded({ extended: false });

// INIT PASSPORT
initializePassport(
	passport,

	// FUNCTION TO FIND USER BASED ON THERE EMAIL
	email => allUsers.find(user => user.email === email),
	id => allUsers.find(user => user._id.toString() === id)
);

// CREATE BODY PARSER APPLICATION
var urlencodedParser = bodyparser.urlencoded({ extended: false });

// setting statements to tell express to use flash and session
app.use(flash());
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false
	})
);

// Set public folder
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Route to handle login path
app.post(
	'/logging-in',
	urlencodedParser,
	passport.authenticate('local', {
		successRedirect: '/index',
		failureRedirect: '/login',
		failureFlash: true
	})
);

// Middleware function for checking that users are authenticated
function checkAuthenticatedUser(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

// middleware function for checking that users is not logged in.
function checkNotAuthenticatedUser(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/index');
	}
	next();
}

// ROUTES

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/index.html'));
});

// INDEX PAGE ROUTE
app.get('/index', (req, res) => {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/teenageindex', (req, res) => {
	res.sendFile(path.join(__dirname + '/teenageindex.html'));
});

app.get('/mentalhealth', (req, res) => {
	res.sendFile(path.join(__dirname + '/mentalhealth.html'));
});

app.get('/sexualhealth', (req, res) => {
	res.sendFile(path.join(__dirname + '/sexualhealth.html'));
});

app.get('/test', (req, res) => {
	res.sendFile(path.join(__dirname + '/test.html'));
});

app.get('/children', (req, res) => {
	res.sendFile(path.join(__dirname + '/children.html'));
});

app.get('/children2', (req, res) => {
	res.sendFile(path.join(__dirname + '/children2.html'));
});


// PATIENTS PAGE ROUTE
app.get('/patients', (req, res) => {
	res.sendFile(path.join(__dirname + '/patients.html'));
});

// FAQ PAGE ROUTE
app.get('/faq', (req, res) => {
	res.sendFile(path.join(__dirname + '/faq.html'));
});

// ABOUT PAGE ROUTE
app.get('/about', (req, res) => {
	res.sendFile(path.join(__dirname + '/about.html'));
});

// HELP PAGE ROUTE
app.get('/help', (req, res) => {
	res.sendFile(path.join(__dirname + '/help.html'));
});

// LOGIN PAGE ROUTE
app.get('/login', checkNotAuthenticatedUser, (req, res) => {
	res.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/success', checkNotAuthenticatedUser, (req, res) => {
	res.sendFile(path.join(__dirname + '/success.html'));
});


// REGISTER PAGE ROUTE
app.get('/register', checkNotAuthenticatedUser, (req, res) => {
	res.sendFile(path.join(__dirname + '/register.html'));
});

// ROUTE TO HANDLE ADD USER
app.post('/addUser', urlencodedParser, (req, res, next) => {
	var hashpassword = bcrypt.hashSync(req.body.password, 10);
	var user = {
		name: req.body.name,
		email: req.body.email,
		password: hashpassword,
		address: req.body.address,
		city: req.body.city,
		postcode: req.body.postcode, 
		ailments: req.body.ailments
	};

	MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		(err, client) => {
			if (err) throw err;
			console.log('you are connected to the database');
			var userCollection = client
				.db('gccnhsapp')
				.collection('registeredUsers');
			userCollection.insertOne(user, (err, result) => {
				if (err) throw err;
				console.log(result.ops);
			});
			client.close();
		}
	);
	res.redirect('/success');
});

app.get("/profile", checkAuthenticatedUser, (req, res) => {

    (url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if(err)throw(err);
    var userCollection = client.db("gccnhsapp").collection("registeredUsers");

    var query = {user: req.user.name};
    userCollection.find(query).toArray((err,result) => {
if (err) throw err;
allUsers = result;
    });
})
    res.render("profile", {name:req.body.name});
});

app.listen(3000, () => {
	MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		(err, client) => {
			var db = client.db('gccnhsapp');
			var userCollection = db.collection('registeredUsers');

			userCollection.find({}).toArray((err, result) => {
				if (err) throw err;
				allUsers = result;
			});
		}
	);

	console.log('Connected on port: 3000');
});
