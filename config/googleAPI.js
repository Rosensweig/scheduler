const unirest = require('unirest');
const auth = require('../config/auth');
var google = require('googleapis');

// const credentials = {
//   client: {
//     id: auth.googleAuth.clientID,
//     secret: auth.googleAuth.clientSecret
//   },
//   auth: {
//     tokenHost: auth.googleAuth.tokenURL,
//     tokenPath: auth.googleAuth.tokenURL,
//     authorizePath: auth.googleAuth.oAuthURL
//   }
// };

// const oauth2 = require('simple-oauth2').create(credentials);

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




module.exports = {
	getCalendars: function() {
        unirest.get(auth.googleAuth.baseURL+'/users/me/calendarList')
        .end(function (response) {
            console.log("Success: "+response.raw_body);
        });
	},

	callback: function(code) {
		oauth2Client.getToken(code, function (err, tokens) {
          // Now tokens contains an access_token and an optional refresh_token. Save them.
          if (!err) {
            console.log("Successfully set credentials.\n Tokens: "+tokens);
            oauth2Client.setCredentials(tokens);
          }
        });
	}



}// ends module.exports