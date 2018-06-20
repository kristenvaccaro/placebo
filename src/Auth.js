import React, { Component } from "react";
import TwitterLogin from "react-twitter-auth";

class App extends Component {
  constructor() {
    super();

    this.state = { isAuthenticated: false, user: null, token: "" };
  }

  onSuccess = response => {
    const token = response.headers.get("x-auth-token");
    response.json().then(user => {
      if (token) {
        console.log(user);
        this.setState({ isAuthenticated: true, user: user, token: token });
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
    let content = !!this.state.isAuthenticated ? (
      <div>
        {this.state.user.username}
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
      />
    );

    return <div className="App">{content}</div>;
  }
}

export default App;
