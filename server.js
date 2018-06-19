"use strict";

//mongoose file must be loaded before all other files in order to provide
// models to other modules
var passport = require("passport"),
  express = require("express"),
  jwt = require("jsonwebtoken"),
  expressJwt = require("express-jwt"),
  router = express.Router(),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  request = require("request"),
  twitterConfig = require("./twitter.config.js");

var passportConfig = require("./passport");

//setup configuration for facebook login
passportConfig();

var app = express();

// enable cors
var corsOption = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["x-auth-token"]
};
app.use(cors(corsOption));

//rest API requirements
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

router.route("/health-check").get(function(req, res) {
  res.status(200);
  res.send("Hello World");
});

var createToken = function(auth) {
  return jwt.sign(
    {
      id: auth.id
    },
    "my-secret",
    {
      expiresIn: 60 * 120
    }
  );
};

var generateToken = function(req, res, next) {
  req.token = createToken(req.auth);
  return next();
};

var sendToken = function(req, res) {
  res.setHeader("x-auth-token", req.token);
  return res.status(200).send(JSON.stringify(req.user));
};

router.route("/auth/twitter/callback").post(function(req, res) {
  console.log("POST /auth/twitter/callback");
  request.post(
    {
      url: "https://api.twitter.com/oauth/request_token",
      oauth: {
        oauth_callback: "http://127.0.0.1:3000/auth/twitter/callback",
        consumer_key: twitterConfig.consumerKey,
        consumer_secret: twitterConfig.consumerSecret
      }
    },
    function(err, r, body) {
      if (err) {
        console.log(err);
        return res.send(500, { message: err.message });
      }
      console.log(body);

      var jsonStr =
        '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
      res.send(JSON.parse(jsonStr));
    }
  );
});

router.route("/auth/twitter").post(
  (req, res, next) => {
    console.log("POST /auth/twitter");
    request.post(
      {
        url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
        oauth: {
          consumer_key: twitterConfig.consumerKey,
          consumer_secret: twitterConfig.consumerSecret,
          token: req.query.oauth_token
        },
        form: { oauth_verifier: req.query.oauth_verifier }
      },
      function(err, r, body) {
        if (err) {
          console.log(err);
          return res.send(500, { message: err.message });
        }
        console.log(body);
        const bodyString =
          '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
        const parsedBody = JSON.parse(bodyString);

        req.body["oauth_token"] = parsedBody.oauth_token;
        req.body["oauth_token_secret"] = parsedBody.oauth_token_secret;
        req.body["user_id"] = parsedBody.user_id;

        next();
      }
    );
  },
  passport.authenticate("twitter-token", { session: false }),
  function(req, res, next) {
    if (!req.user) {
      return res.send(401, "User Not Authenticated");
    }
    console.log(res);

    // prepare token for API
    req.auth = {
      id: req.user.id
    };

    return next();
  },
  generateToken,
  sendToken
);

//token handling middleware
var authenticate = expressJwt({
  secret: "my-secret",
  requestProperty: "auth",
  getToken: function(req) {
    if (req.headers["x-auth-token"]) {
      return req.headers["x-auth-token"];
    }
    return null;
  }
});

app.use("/", router);

app.listen(3000);
module.exports = app;

console.log("Server running at http://localhost:3000/");
