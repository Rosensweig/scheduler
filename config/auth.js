// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'googleAuth' : {
        'clientID'      : 	'226858249225-lu5n8a1eam9lmigi8p1ivdppo11jtqr1.apps.googleusercontent.com',
        'clientSecret'  : 	'psNKuz6hRsxkhqd1Qa3jaOBR',
        'callbackURL'   : 	'http://localhost:8080/auth/google/callback',
        'baseURL'		: 	'https://www.googleapis.com/calendar/v3',
        'oAuthURL'		:  	'https://accounts.google.com/o/oauth2/auth',
        'tokenURL'		: 	'https://accounts.google.com/o/oauth2/token',
        'access_type'	: 	'offline'
    }

};
