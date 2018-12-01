import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Chip from "@material-ui/core/Chip";
import Button from "@material-ui/core/Button";
import axios from "axios";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      user: null,
      password: null
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(event, field) {
    switch (field) {
      case "user":
        this.setState({
          error: null,
          user: event.target.value
        });
        break;
      case "password":
        this.setState({
          error: null,
          password: event.target.value
        });
        break;
      default:
        break;
    }
  }

  onSubmit() {
    const { onLogin } = this.props;
    const { user, password } = this.state;
    axios({
      baseURL: "http://192.168.1.104:5000/checkUser",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Origin": "*"
      },
      auth: {
        username: user,
        password: password
      }
    })
      .then(response => {
        console.log(response);
        if (response.status === 200) {
          console.log("Response 200", response);
          if (response.data.token !== undefined) {
            onLogin(user, response.data.token);
          } else {
            console.log(response.data.info);
            this.setState({
              error: response.data.info || "Something wrong"
            });
          }
        } else {
          this.setState({
            error: "Something wrong"
          });
        }
      })
      .catch(error => {
        console.log(error.response.status);
        if (error.response.status === 401) {
          this.setState({
            error: error.response.statusText
          });
        } else {
          this.setState({
            error:
              error.response !== undefined
                ? error.response.data.error
                : error.toString()
          });
        }
      });
  }

  render() {
    const { error } = this.state;
    return (
      <Card>
        <Grid
          direction="column"
          container
          justify="center"
          alignItems="center"
          spacing={16}
          style={{ padding: 40 }}
        >
          <Grid item>
            <TextField
              autoFocus
              placeholder="user"
              onChange={event => this.onChange(event, "user")}
            />
          </Grid>
          <Grid item>
            <TextField
              placeholder="password"
              onChange={event => this.onChange(event, "password")}
              type="password"
            />
          </Grid>

          <Grid item>{error && <Chip color="secondary" label={error} />}</Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={this.onSubmit}>
              Login
            </Button>
          </Grid>
        </Grid>
      </Card>
    );
  }
}

export default Login;
