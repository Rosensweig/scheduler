const auth = require('../config/auth');
var google = require('googleapis');
var User = require('../app/models/user');

var OAuth2 = google.auth.OAuth2;

var oAuth2Client = new OAuth2(
  auth.googleAuth.clientID,
  auth.googleAuth.clientSecret,
  auth.googleAuth.callbackURL
);

var calendar = google.calendar({
	version: 'v3',
	auth: oAuth2Client
});

module.exports = {

	setCredentials: function (user){
		var self = this;
		return new Promise (function(resolve, reject) {
			oAuth2Client.setCredentials({
				token: user.google.token,
				refresh_token: user.google.refreshToken
			});
			if (Date.now()>user.google.expires) {
				self.refreshTokens(user._id);
				process.nextTick(resolve(true));
			}
			else {
				resolve(false);
			}
		});
	},

	refreshTokens: function(userId) {
		oAuth2Client.refreshAccessToken(function(err, tokens) {
			User.findOneAndUpdate(
				{
					_id: userId
				},
				{
					$set: {
						"google.refreshToken":tokens.refresh_token,
						"google.token" : tokens.access_token,
						"google.expires" : new Date(tokens.expiry_date)
					}
				}
			).then(function(user) {
				console.log("Successfully refreshed tokens, and stored response.");
				console.log("User: "+user);
			});
		});
	},

	// Adjust for promise support!!
	getCalendars: function(email) {
		var now = new Date();
		var tomorrow = new Date();
		tomorrow.setDate(now.getDate()+1);
        return new Promise(function(resolve, reject) {
        	calendar.events.list({
				calendarId: email,
				timeMin: now.toISOString(),
				timeMax: tomorrow.toISOString(),
				singleEvents: true,
				orderBy: 'startTime'
			}, function(err, response) {
				if (err) {
					console.log("Google Calendar returned an error: "+err);
					reject(err);
				}
				var events = response.items;
				if (events.length === 0) {
					console.log('No upcoming events found.');
				} else {
					console.log('Upcoming events found.');

				}
				resolve(events);
			});
        });
	},

	callback: function(code) {
		oAuth2Client.getToken(code, function (err, tokens) {
          // Now tokens contains an access_token and an optional refresh_token. Save them.
          if (!err) {
            console.log("Successfully set credentials.\n Tokens: "+tokens);
            oauth2Client.setCredentials(tokens);
          }
        });
	}



}// ends module.exports