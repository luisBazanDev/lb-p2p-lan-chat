import React from "react";
import { Text } from "ink";
import { UDP_PORT } from "../../config.js";

function UdpStatus() {
  return <Text color={"redBright"}>:{UDP_PORT()} UDP</Text>;
}

export default UdpStatus;
