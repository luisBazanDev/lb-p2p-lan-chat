import React from "react";
import { Text } from "ink";
import { TCP_PORT } from "../../config.js";

function TcpStatus() {
  return <Text color={"blueBright"}>:{TCP_PORT()} TCP</Text>;
}

export default TcpStatus;
