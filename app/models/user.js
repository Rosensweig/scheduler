// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({

    google           : {
        id           : String,
        token        : String,
        expires      : Date,
        refreshToken : String,
        email        : String,
        name         : String
    },
    preferences: {
        default: Number,
        rules: [],
        availability: {
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: []
        }
    }

});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
