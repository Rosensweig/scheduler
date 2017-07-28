// app/routes.js

var User = require('./models/user');
//const googleAPI = require('../config/googleAPI');
const unirest = require('unirest');
const auth = require('../config/auth');
var google = require('googleapis');

var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
  auth.googleAuth.clientID,
  auth.googleAuth.clientSecret,
  auth.googleAuth.callbackURL
);

var scopes = ['profile', 'email', 'https://www.googleapis.com/auth/calendar'];

var url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',
  scope: scopes,
});

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    app.get('/whatever', function(req, res) {
        res.json({"data":"Hey, it's working!"});
    });



    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', (req, res) => {
        // passport.authenticate('google', { 
        //     scope : ['profile', 'email', 'https://www.googleapis.com/auth/calendar'] 
        // })
        // make the unirest call
        console.log("Request url: "+url);
        unirest.get(url)
        .end((response) => res.send(response.body));
    });



    // the callback after google has authenticated the user
    // app.get('/auth/google/callback',
    //     passport.authenticate('google', {
    //         successRedirect : '/profile',
    //         failureRedirect : '/'
    //     })
    // );

    app.get('/auth/google/callback', (req, res) => {
        var code = req.query.code;
        console.log(code);
        callback(code,function(){
            res.redirect('/profile');
        });
    });


    // CALENDAR
    app.get('/calendar', (req, res) => {
        //testing frontend-backend proxy connection
        res.json({"message": "Hello, world!"});
    });

    app.get('/calendar2', (req, res) => {
        googleAPI.getCalendars();
        res.json({"message": "Hello, world!"});
    });



};

function callback(code,done) {
    console.log("Hello from callback function");
    oauth2Client.getToken(code, function (err, tokens) {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if (!err) {
        console.log("Successfully set credentials.\n Tokens: "+Object.keys(tokens));

        oauth2Client.setCredentials(tokens);
        done();
      }
      else {
        console.log("Error: "+err);
      }
    });
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.user)
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
