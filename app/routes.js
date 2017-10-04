// app/routes.js

var User = require('./models/user');
const googleAPI = require('../config/googleAPI');
const auth = require('../config/auth');
var google = require('googleapis');

const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
var momentExt = require('../config/moment');

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
  scope: scopes
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
    app.get('/auth/google', 
        //passport version
        passport.authenticate('google', { 
            scope : ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
            accessType: "offline" 
        })
    );



    // callback -- passport version -- after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        })
    );


    // CALENDAR
    app.get('/calendar', isLoggedIn, (req, res) => {
        var eventsArray = [];
        var availability = [moment.range(moment(), moment().add(12, "hours"))];
        var user = req.user;
        googleAPI.setCredentials(
            user
        ).then(function(response) {
            return googleAPI.getCalendars(req.user.google.email);
        }).then(function(events) {
            for (var i=0; i<events.length; i++) {
                console.log("Original event: ",events[i].start, ", ", events[i].end);
                var start = moment(events[i].start.dateTime);
                var end = moment(events[i].end.dateTime);
                if (false /*check for specific rules*/) {
                    //run different rules
                } else { //default commute time
                    start = start.subtract(user.preferences.default, "minutes");
                    end = end.add(user.preferences.default, "minutes");
                }
                var temp = moment.range(start, end);
                console.log("Modified event: ", temp.toString());
                eventsArray.push(temp);
            }
            availability = momentExt.subtractArrays(availability, eventsArray);
            res.json({availability: availability});
        });
    })

}; // closes module.exports

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
