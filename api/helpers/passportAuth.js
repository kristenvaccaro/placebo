'user strict';

const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
// const User = require('mongoose').model('User');

module.exports = function() {

  console.log("loading passportAuth");
  // const base = process.env.NODE_ENV === "production"
  //   ? process.env.PROD_BASE_URL
  //   :`http://localhost:5000`;
  const callback_url = "/callback"; // `${base}/apo/callback`;

  passport.serializeUser(function(user, done) {
    return done(null, user.id);
  });

  passport.deserializeUser(function(userId, done) {
    console.log( "passport deserializeUser doing nothing id:", userId);
    return done(err,null);
    // User.findById(userId, function(err, user) {
    //   return done(err, user);
    // })
  });

  passport.use(new TwitterStrategy({
    consumerKey: process.env.CONSUMER_KEY || 'eiVbxbQIfNYWCJJfXXwkSTflK', // config.twitter.consumerKey,
    consumerSecret: process.env.CONSUMER_SECRET || '8zJtZZATHYxh2sh7uAXhJBufhtUfPfffqE6nI0IQXf7h577nbe', // config.twitter.consumerSecret,
    callbackURL: callback_url // config.twitter.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("getting to twitter strategy part");
    return done(null, profile);
    // var searchQuery = {
    //   twitterId: profile.id
    // };
    // var update = {
    //   twitterId: profile.id,
    //   name: profile.displayName,
    //   email:profile.email
    // };
    // var updateOptions = {
    //   upsert: true
    // };
    // User.findOneAndUpdate(searchQuery, update, updateOptions, function(err, user) {
    //     return done(err, user);
    // });
  }));
};

// module.exports = {
//     get_data: get_data,
//     get_all_data_id: get_all_data_id,
//     get_all_data_cursor: get_all_data_cursor,
//     get_profile_img: get_profile_img
// }
