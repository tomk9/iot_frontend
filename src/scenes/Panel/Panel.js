import React, { Component, Fragment } from "react";
import AppBar from "@material-ui/core/AppBar";
import Card from "@material-ui/core/Card";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Chip from "@material-ui/core/Chip";
import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";
import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import moment from "moment";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

import Bar from "../../components/Bar/Bar";
import Camera from "../../components/Camera/Camera";

class Panel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      led1: false,
      led2: false,
      led3: false,
      servo: 75,
      rows: [
        { id: 0, name: "Dampness", value: null },
        { id: 1, name: "Distance", value: null },
        { id: 2, name: "Light Intensity 1", value: null },
        { id: 3, name: "Light Intensity 2", value: null },
        { id: 4, name: "Pressure", value: null },
        { id: 5, name: "Temperature", value: null }
      ],
      date: null,
      data: [],
      graphTitle: "Temperature",
      graphData: "temperature"
    };
    this.handleChange = this.handleChange.bind(this);
  }
  StyledSlider = withStyles({
    root: {
      padding: "22px 0px"
    }
  })(Slider);

  componentDidMount() {
    const myTimer = setInterval(() => {
      const { user, token } = this.props;
      const { rows } = this.state;
      axios({
        baseURL: "http://192.168.1.104:5000/sensors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Access-Control-Allow-Origin": "*",
          Authentication: token
        },
        auth: {
          username: user
        }
      })
        .then(response => {
          console.log(response);
          if (response.status === 200) {
            console.log("Response 200", response);
            if (response.data.date !== undefined) {
              rows[0].value = response.data.dampness;
              rows[1].value = response.data.distance;
              rows[2].value = response.data.lightIntensity1;
              rows[3].value = response.data.lightIntensity2;
              rows[4].value = response.data.pressure;
              rows[5].value = response.data.temperature;
              this.setState({
                rows,
                date: response.data.date
              });
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
          //   console.log(error.response.status);
          if (error.response && error.response.status === 401) {
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
      axios({
        baseURL: "http://192.168.1.104:5000/sensorsN",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Access-Control-Allow-Origin": "*",
          Authentication: token
        },
        auth: {
          username: user
        },
        params: {
          many: 50
        }
      })
        .then(response => {
          console.log(response);
          if (response.status === 200) {
            console.log("Response 200", response);
            if (response.data[0].date !== undefined) {
              this.setState({
                data: response.data.reverse().map(item => {
                  const date = new Date(Date.parse(item.date));
                  item.date = moment.utc(date).format("HH:mm:ss");
                  return item;
                })
              });
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
          console.log(error.response);
          if (error.response && error.response.status === 401) {
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
    }, 1000);
  }

  handleChange(name) {
    return event => {
      this.setState({ [name]: event.target.checked }, () => this.sterr(0));
    };
  }

  handleChangeServo = (event, value) => {
    this.setState({ servo: value }, () => this.sterr(1));
  };

  sterr = e => {
    const { user, token } = this.props;
    const { led1, led2, led3, servo } = this.state;
    let data;
    switch (e) {
      case 0:
        data = {
          led1: led1.toString(),
          led2: led2.toString(),
          led3: led3.toString()
        };
        break;
      case 1:
        data = {
          servo: servo / 2 + 50
        };
        break;
      default:
        data = {
          led1: led1.toString(),
          led2: led2.toString(),
          led3: led3.toString(),
          servo: servo / 2 + 50
        };
    }
    axios({
      method: "put",
      baseURL: "http://192.168.1.104:5000/sterr",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        Authentication: token
      },
      auth: {
        username: user
      },
      data: data
    })
      .then(response => {
        console.log(response);
        if (response.status === 200) {
          console.log("Response 200", response);
          if (response.data.info !== undefined) {
            console.log("Info", response.data.info);
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
  };

  render() {
    const { onLogout, user } = this.props;
    const {
      led1,
      led2,
      led3,
      servo,
      rows,
      date,
      data,
      graphTitle,
      graphData
    } = this.state;
    return (
      <Card>
        <Grid
          direction="row"
          container
          justify="center"
          alignItems="center"
          spacing={16}
          style={{ padding: 40 }}
        >
          <Grid item>
            <Grid
              direction="column"
              container
              justify="center"
              alignItems="center"
              spacing={16}
              style={{ padding: 40 }}
            >
              <Grid item>
                <Typography variant="h6" color="inherit">
                  {user}
                </Typography>
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" onClick={onLogout}>
                  Logout
                </Button>
              </Grid>
              <Grid item>
                <Typography variant="h6" color="inherit">
                  Control
                </Typography>
              </Grid>
              <Grid item>
                <FormGroup>
                  <Typography id="servo">Blinds</Typography>
                  <this.StyledSlider
                    value={servo}
                    aria-labelledby="servo"
                    onChange={this.handleChangeServo}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={led1}
                        onChange={this.handleChange("led1")}
                        value="led1"
                        color="primary"
                      />
                    }
                    label="Light 1"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={led2}
                        onChange={this.handleChange("led2")}
                        value="led2"
                        color="primary"
                      />
                    }
                    label="Light 2"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={led3}
                        onChange={this.handleChange("led3")}
                        value="led3"
                        color="primary"
                      />
                    }
                    label="Light 3"
                  />
                </FormGroup>
              </Grid>
              <Grid item>
                <Typography variant="h6" color="inherit">
                  Data
                </Typography>
              </Grid>
              <Grid>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sensor</TableCell>
                      <TableCell numeric>Value</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {rows.map(row => {
                      return (
                        <TableRow key={row.id}>
                          <TableCell component="th" scope="row">
                            <ButtonBase
                              onClick={() => {
                                let graphData = "temperature";
                                switch (row.id) {
                                  case 0:
                                    graphData = "dampness";
                                    break;
                                  case 1:
                                    graphData = "distance";
                                    break;
                                  case 2:
                                    graphData = "lightIntensity1";
                                    break;
                                  case 3:
                                    graphData = "lightIntensity2";
                                    break;
                                  case 4:
                                    graphData = "pressure";
                                    break;
                                  case 5:
                                    graphData = "temperature";
                                    break;
                                  default:
                                    graphData = "temperature";
                                }
                                this.setState({
                                  graphTitle: row.name,
                                  graphData
                                });
                              }}
                            >
                              {row.name}
                            </ButtonBase>
                          </TableCell>
                          <TableCell numeric>{row.value}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Grid>
              <Grid item>
                <Typography variant="caption" color="inherit">
                  {date}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid
              direction="column"
              container
              justify="center"
              alignItems="center"
              spacing={16}
              style={{ padding: 40 }}
            >
              <Grid item>
                <Typography variant="h6" color="inherit">
                  Preview
                </Typography>
              </Grid>
              <Grid item>
                <Camera />
              </Grid>
              <Grid item>
                <Typography variant="h6" color="inherit">
                  {graphTitle}
                </Typography>
              </Grid>
              <Grid item>
                <LineChart width={640} height={360} data={data}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Line type="monotone" dataKey={graphData} stroke="#8884d8" />
                </LineChart>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    );
  }
}

export default Panel;
