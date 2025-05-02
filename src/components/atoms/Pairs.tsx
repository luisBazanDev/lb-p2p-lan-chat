import React from "react";
import { Text } from "ink";
import { getPairs } from "../../config.js";

function Pairs() {
  return <Text color={"green"}>{getPairs().length} Pairs</Text>;
}

export default Pairs;
