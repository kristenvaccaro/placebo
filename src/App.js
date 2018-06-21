import React, { Component } from "react";
import Tweet from "./Tweet.js";
import logo from "./Twitter_Logo_WhiteOnBlue.svg";
import Authentication from "./Authentication/Authentication.js";
import "./App.css";
import "./Authentication/Authentication";
import TweetFilterer from "./TweetFilterer.js";
import "./App.css";
import FilterControl from "./FilterControl.js";
import TweetView from "./TweetView";

import TwitterLogin from "react-twitter-auth";

class App extends Component {
  constructor(props) {
    super(props);
    this.auth = new Authentication();
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
    this.messages = [];
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
        this.setState({ isAuthenticated: true, user: data.user, token: token });
        this.allTweets = data.tweets.map(t => new Tweet(t));
        this.filterer = new TweetFilterer(this.allTweets);
        this.setState({ tweets: this.allTweets });
      }
    });
  };

  onFailed = error => {
    alert(error);
  };

  logout = () => {
    this.setState({ isAuthenticated: false, token: "", user: null });
  };

  render() {
    let auth = this.state.isAuthenticated ? (
      <div>
        <img src={this.state.user.photos[0].value} alt="profile"/>
        <button onClick={this.logout} className="button">
          Log out
        </button>
      </div>
    ) : (
      <TwitterLogin
        loginUrl="http://localhost:3000/api/v1/auth/twitter"
        onFailure={this.onFailed}
        onSuccess={this.onSuccess}
        requestTokenUrl="http://localhost:3000/api/v1/auth/twitter/reverse"
        showIcon={false}
      />
    );
    return (
      <div className="App">
        <div className="App-header">
          <span className="Title-area col-xs-8 col-sm-5">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="Title">Twitter Study</h1>
          </span>
          <span className="Authentication-area col-xs-4 col-sm-3">{auth}</span>
        </div>

        <div className="Tweet-list">
          {this.state.isAuthenticated &&
            this.state.tweets.map(r =>
              (<TweetView key={r.id.toString()} tweet={r} />)
            )}
        </div>

        <div className="App-footer">
          <FilterControl
            dropdownClass={"Dropdown col-xs-2"}
            sliderClass={"Slider col-xs-9"}
            onChange={filterState => this.loadFilteredTweets(filterState)}
            tweets={this.state.tweets}
          />
        </div>
      </div>
    );
  }
}
export default App;
