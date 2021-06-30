// config/passport.js

// load all the things we need
//var LocalStrategy    = require('passport-local').Strategy;
//var FacebookStrategy = require('passport-facebook').Strategy;
//var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User = require('../models/User');

var USE_PROXY = false; // * Bin you should set this to true



module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
      console.log('in serializeUser '+user)
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
      console.log('in deserializeUser')
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))
    // code for facebook (use('facebook', new FacebookStrategy))
    // code for twitter (use('twitter', new TwitterStrategy))

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    // load the auth variables

    var configAuth = require('./auth');
    const clientID = configAuth.googleAuth.clientID
    const clientSecret = configAuth.googleAuth.clientSecret
    const callbackURL = configAuth.googleAuth.callbackURL


/*
    const clientID = process.env.clientID
    const clientSecret = process.env.clientSecret
    const callbackURL = process.env.callbackURL
*/

    const gStrategy = (new GoogleStrategy({

        clientID        : clientID,
        clientSecret    : clientSecret,
        callbackURL     : callbackURL,

    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {
           console.log("looking for userid .. making call to User.findOne")
            // try to find the user based on their google id
            User.findOne({ 'googleid' : profile.id }, function(err, user) {
                console.log("inside callback for User.findOne")
                console.dir(err)
                console.dir(user)
                console.log("\n\n")
                if (err){
                    console.log("error in nextTick:"+err)
                    return done(err);
                } else if (user) {
                    console.log(`the user was found ${user}`)
                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    console.log(`we need to create a new user`)
                    console.dir(profile)
                    console.log(`\n****\n`)
                    // if the user isnt in our database, create a new user
                    var newUser
                     = new User(
                         {googleid: profile.id,
                          googletoken: token,
                          googlename:profile.displayName,
                          googleemail:profile.emails[0].value,
                        });

                    // set all of the relevant information
                    /*
                    newUser.google = {}
                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.google.name  = profile.displayName;
                    newUser.google.email = profile.emails[0].value; // pull the first email
                    */
                    // save the user
                    newUser.save(function(err) {
                      console.log("saving the new user")
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });

    }));
    if (USE_PROXY) {
        var HttpsProxyAgent = require('https-proxy-agent');
        var agent = new HttpsProxyAgent(process.env.HTTP_PROXY || "http://127.0.0.1:1087");
        gStrategy._oauth2.setAgent(agent);
    }
    passport.use(gStrategy);

};
