import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";

import Login from "./scenes/Login/Login";
import Panel from "./scenes/Panel/Panel";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: localStorage.getItem("user"),
      token: localStorage.getItem("token")
    };
    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
  }
  onLogin(user, token) {
    this.setState({
      user,
      token
    });
    localStorage.setItem("user", user);
    localStorage.setItem("token", token);
  }
  onLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    this.setState({
      user: null,
      token: null
    });
  }
  render() {
    const { user, token } = this.state;
    return (
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        style={{ padding: 40 }}
      >
        {user === null || token === null ? (
          <Login onLogin={this.onLogin} />
        ) : (
          <Panel onLogout={this.onLogout} user={user} token={token} />
        )}
      </Grid>
    );
  }
}

export default App;
