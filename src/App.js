import React, { Component } from "react";

import Tweet from "./Tweet.js";
import "./App.css";
import TweetFilterer from "./TweetFilterer.js";
import FilterControl from "./FilterControl.js";
import TweetView from "./TweetView";

import TwitterLogin from "react-twitter-auth";

var shuffle = require("shuffle-array");

/* N     = no control, most recent
   NR    = no control, random subset of feed
   YPOP  = yes control, popularity real
   YPOPR = yes control, popularity random
   YR    = yes control, random = random
*/
const OPTIONS = ["N", "NR", "YPOP", "YPOPR", "YR"];
const CONTROL = false;
const RANDOM = false;
const POPR = false;

const TWEET_DISPLAY_RANGE = 20;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      max: 100,
      min: 0,
      filtervalue: undefined,
      isAuthenticated: false,
      user: null,
      tweets: [],
      token: ""
    };

    this.filterer = new TweetFilterer([]);
    this.allTweets = [];
  }

  componentDidMount() {
    if (typeof Storage !== undefined) {
      const cacheHits = localStorage.getItem("time");
      console.log(cacheHits);
      if (cacheHits) {
        let last = new Date(cacheHits);
        let curr = new Date();
        var seconds = (curr.getTime() - last.getTime()) / 1000;
        // use stored data in one day
        if (seconds <= 60 * 60 * 24) {
          const USER = JSON.parse(localStorage.getItem("user"));
          const TWEETS = JSON.parse(localStorage.getItem("tweets"));
          this.allTweets = TWEETS.map(t => new Tweet(t));
          this.filterer = new TweetFilterer(this.allTweets);
          this.setState({
            isAuthenticated: true,
            user: USER,
            tweets: this.allTweets
          });
        }
      }
    }
  }

  onSliderChange(value) {
    this.setState({
      value
    });
  }

  // A filterState is an object where they keys are one of FREQUENCY, CELEBRITY, POPULARITY, CLOSENESS, SENTIMENT,
  // And the values are the numerical minumum values of the appropriate feature. Not all of the keys
  // must appear, but no keys other than the ones specifically allowed may appear.
  loadFilteredTweets(filterState) {
    this.filterer
      .filterTweets(filterState)
      .then(tweets => this.setState({ tweets }));
  }

  onSuccess = response => {
    const token = response.headers.get("x-auth-token");
    response.json().then(data => {
      if (token) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("tweets", JSON.stringify(data.tweets));
        localStorage.setItem("time", Date());

        this.setState({ isAuthenticated: true, user: data.user, token: token });
        let allTweets = data.tweets.map(t => new Tweet(t));

        var allPopularityValues = allTweets.map(
          (tweet, i) => tweet.retweet_count
        );

        if (POPR){
          shuffle(allPopularityValues);
          allTweets.forEach(
            tweet => (tweet.random_retweet_count = allPopularityValues.pop())
          );
        }
        console.log(allTweets);

        this.filterer = new TweetFilterer(allTweets);
        this.setState({ tweets: allTweets });
      }
    });
  };

  onFailed = error => {
    alert(error);
  };

  logout = () => {
    this.setState({ isAuthenticated: false, token: "", user: null });
    localStorage.clear();
  };

  render() {
    let base_url = process.env.REACT_APP_URL || "http://localhost:3000/";
    console.log(base_url);
    let loginUrl = base_url + "api/auth/twitter";
    let requestTokenUrl = base_url + "api/auth/twitter/reverse";
    let auth = this.state.isAuthenticated ? (
      <span className="d-flex">
        <span className="d-none d-lg-block navbar-text mr-2">
          {this.state.user.username}
        </span>
        <img
          className="rounded mr-1 img-fluid"
          src={this.state.user.photos[0].value}
          alt="profile"
        />
        <button
          onClick={this.logout}
          className="btn btn-outline-light mr-1"
          type="button"
        >
          Log out
        </button>
      </span>
    ) : (
      <TwitterLogin
        loginUrl={loginUrl}
        onFailure={this.onFailed}
        onSuccess={this.onSuccess}
        requestTokenUrl={requestTokenUrl}
        showIcon={false}
        className="my-2 my-sm-0 btn btn-primary"
      />
    );
    return (
      <div className="App container-fluid">
        <nav className="navbar navbar-dark App-header fixed-top">
          <span className="navbar-brand mb-0 h1">Twitter Study</span>
          {auth}
        </nav>

        <div className="Tweet-list ml-xs-1 ml-md-5 mt-2">
          {this.state.isAuthenticated &&
            this.state.tweets.slice(0, TWEET_DISPLAY_RANGE).map(r => (
              <TweetView key={r.id.toString()} tweet={r} />
            ))}
        </div>

        { CONTROL &&
          <div className="App-footer fixed-bottom w-100 bg-dark">
            <FilterControl
              dropdownClass={"Dropdown col-xs-2 ml-2"}
              sliderClass={"Slider col mt-4 mr-5"}
              onChange={filterState => this.loadFilteredTweets(filterState)}
              tweets={this.allTweets}
            />
          </div>
        }
      </div>
    );
  }
}
export default App;
