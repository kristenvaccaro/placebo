//URI used to connect with mongo db
var mongo_connection_uri =
  "mongodb://tweed-study:uiuc2017@ds251245.mlab.com:51245/tweed-study";
var mongodb = require("mongodb");
var express = require("express"),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require("mongoose"),
  Task = require("./api/models/model"), //created model loading here
  bodyParser = require("body-parser");

var passport = require("passport");
var Strategy = require("passport-twitter").Strategy;

//mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost/Tododb');

// Middleware for parsing incoming HTTP requests and then passing it onto the server
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(bodyParser.json());

var routes = require("./api/routes/route"); //importing route
routes(app); //register the route

app.listen(port);

passport.use(
  new Strategy(
    {
      consumerKey: process.env.CONSUMER_KEY || "eiVbxbQIfNYWCJJfXXwkSTflK",
      consumerSecret:
        process.env.CONSUMER_SECRET ||
        "8zJtZZATHYxh2sh7uAXhJBufhtUfPfffqE6nI0IQXf7h577nbe",
      callbackURL: "http://127.0.0.1:3000/login/twitter/return"
    },
    function(token, tokenSecret, profile, cb) {
      // In this example, the user's Twitter profile is supplied as the user
      // record.  In a production-quality application, the Twitter profile should
      // be associated with a user record in the application's database, which
      // allows for account linking and authentication with other identity
      // providers.
      return cb(null, profile);
    }
  )
);

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

app.get("/login/twitter",
  passport.authenticate("twitter"));

app.get(
  "/login/twitter/return",
  passport.authenticate("twitter", { failureRedirect: "/" }),
  function(req, res) {
    console.log("Redirected");
    res.redirect("/");
  }
);

/*
 *TODO: Team #3
 *Task: Pull data from someone's feed and save it into an object and print out the complete response
 */
console.log("P.U.R.E express server started on port " + port);

/**
 The following code snippet establishes a connection with mongodb
 */
mongodb.MongoClient.connect(
  mongo_connection_uri,
  function(err, database) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    // Save database object from the callback for reuse.
    var db = database;
    console.log("Database connection ready");
  }
);

/**
 The following code snippets establish the routes for MongoDB interaction
 */
var friends_db = require("./src/db_routes/friends_db");
var messages_db = require("./src/db_routes/messages_db");
var tweets_db = require("./src/db_routes/tweets_db");
var user_db = require("./src/db_routes/user_db");

app.use("/db/users", user_db);
app.use("/db/friends", friends_db);
app.use("db/tweets", tweets_db);
app.use("db/messages", messages_db);
