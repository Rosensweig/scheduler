// config/passport.js

// load all the things we need
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User       = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });



    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        access_type     : "offline",
        passReqToCallback: true

    },
    function(req, token, refreshToken, params, profile, done) {
        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {
            if (!req.user) {
                // try to find the user based on their google id
                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    return saveUser(user, token, refreshToken, params, profile, done);
                });
            } else {
                var user                    = req.user; // pull the user out of the session
                return saveUser(user, token, refreshToken, params, profile, done);
            }
        });

    }));

};

function saveUser(user, token, refreshToken, params, profile, done) {
    if (!user) {
        user = new User();
        user.google.id              = profile.id;
        user.google.name            = profile.displayName;
        user.google.email           = profile.emails[0].value;
    }
    user.google.token               = token;
    if (refreshToken) {
        user.google.refreshToken    = refreshToken
        user.google.expires         = Date.now() + params.expires_in*1000
    }
    user.save(function(err) {
        if (err)
            throw err;
        return done(null, user);
    });
}