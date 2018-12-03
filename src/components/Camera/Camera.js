import React, { PureComponent } from "react";

class Camera extends PureComponent {
  render() {
    return (
      <img
        alt=""
        src="http://192.168.1.104:8081/"
       // style={{ transform: "scale(0.5)" }}
        style={{ height: "360px" }}
      />
    );
  }
}

export default Camera;
