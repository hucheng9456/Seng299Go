//-----------------------------------------------------------------------------
//     INCLUDES
//-----------------------------------------------------------------------------
"use strict";

var stackTrace = require('stack-trace');
var Server = new (require('./src/Server'));
var express = require('express')
var app = express();
var http = require('http').Server(app);

var io = require('socket.io')(http);
var ios = require('socket.io-express-session');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Configuration
const mongoport = process.env.MONGO_PORT || 27017;
const weburl = process.env.WEB_URL || 'http://localhost';
const port = process.env.PORT || 3000;
const developmentMode = process.env.NODE_ENV !== 'production';
const googleClientID = process.env.GOOGLE_CLIENT_ID || "1042858849145-hqg47cutf9jdgb7u1c373q433bhsui8f.apps.googleusercontent.com";
const googleSecret = process.env.GOOGLE_SECRET || "Ri-TWGe7QTl4qEBRmnvg0M6z";
const googleCallback = process.env.GOOGLE_CALLBACK || `${weburl}:${port}/auth/callback`;
const sessionSecret = process.env.SESSION_SECRET || "Seng299Group15";

var database = new (require('./src/Database'))(mongoport);

var session = require('express-session')({ secret: 'sessionSecret', resave: true, saveUninitialized: true });

// Passport configuration
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

// Inject live reload before the static files if applicable

if (developmentMode) {

	app.use(require('connect-livereload')({
    port: 35729
  }));
}

// Root endpoint

app.get('/', (req, res, err) => {

	if (!req.isAuthenticated()) {

		res.sendFile('public/login.html', { root: __dirname });
	} else {

		res.sendFile('public/index.html', { root: __dirname });
	}
});

// Public folder

app.use(express.static('public'));

// Authentication

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

try {
	passport.use(new GoogleStrategy({
	    clientID: googleClientID,
	    clientSecret: googleSecret,
	    callbackURL: googleCallback
	  },
	  (accessToken, refreshToken, profile, done) => {

  		database.loadUser(profile.id, (doc) => {
  		
  			done(null, { id: profile.id, numGamesPlayed: doc ? doc.numGamesPlayed : 0, fullName: profile.displayName, profilePicture: profile._json.image.url });
  		});
	  
	  	// The database will need to be called here to retrieve/save the users info
	  	//done(null, { id : profile.id, l });
	  }
	));

} catch(err) {
	console.log(err);
	console.log("Google OAuth is not configured properly, therefore authentication will not work.");
}

app.get('/auth',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }
));

app.get('/auth/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {

  	// Save resulting user into session data
  	req.session.user = req.user;

    res.redirect('/');
	}
);

app.get('/logout', (req, res, err) => {

  req.logout();

  res.redirect('/');
});

//-----------------------------------------------------------------------------
//     CONNECTIONS
//-----------------------------------------------------------------------------

const activeGamePlayers = [];

io.use(ios(session));

io.on('connection', socket => {

	const user = Object.assign({}, socket.handshake.session.user, { socket });

  if (socket.handshake.session.user) {

  	console.log(user.fullName + " connected");

    socket.emit('connected', socket.handshake.session.user);

    socket.on('error', err => {

      console.log(stackTrace.parse(err)[0]);

      console.log('Socket error: ', err);
    });

    for (var i = 0; i < activeGamePlayers.length; i++) {
      if (activeGamePlayers[i].id === user.id) {

        Server.reconnectGame(user, activeGamePlayers[i].activeGame);

        activeGamePlayers[i] = user;

        break;
      }
    }

  	// This function runs when th00 client sends a 'createGame' message
  	socket.on('createGame', (gameType, boardSize, colour) => {

  		if (Server.createGame(user, gameType, boardSize, colour)) {
        activeGamePlayers.push(user);
      }
    });

  	socket.on('joinGame', id => {

      if (Server.joinGame(user, id)) {
        activeGamePlayers.push(user);
      }
    });
  	
  	socket.on('playMove', (x, y, pass) => {
  	
  		Server.playMove(user, x, y, pass);
  	});

  	socket.on('requestReplay', gameID => {

  		Server.requestReplay(user, gameID);
  	});

  	socket.on('replayMove', index => {

  		Server.replayMove(user, index);
  	});

    socket.on('leaveGame', () => {

    for (var i = 0; i < activeGamePlayers.length; i++) {
      if (activeGamePlayers[i].id === user.id) {

        Server.leaveGame(user, activeGamePlayers[i].activeGame);

        user.activeGame = null;
        user.colour = null;

        //delete activeGamePlayers[i];
      }
    }    
    });

  } else {
		console.log("Unauthenticated user connected");
	}

  socket.on('disconnect', () => {
    console.log('User disconnected');

    //console.log("disconnected", user);

    let idx = activeGamePlayers.findIndex(_user => _user === user);

    if (idx !== -1) {
      //console.log(activeGamePlayers.splice(idx, 1));

      Server.onDisconnected(user, user.activeGame);
    }
  });
});

// Development mode live reload
if (developmentMode) {

	require('express-livereload')(app);
}

console.log("Running in " + (developmentMode ? "development" : "production") + " mode");

http.listen(port, () => console.log(`listening on ${weburl}:${port}`));

//when server closes, save all games
process.on('SIGINT', function() {
	console.log("storing all games");
	database.storeAllGames();
	
	process.exit();
});
