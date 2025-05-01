import React from "react";
import { Text } from "ink";
import { getPairs } from "../../config.js";

function Pairs() {
  return (
    <Text color={"green"}>
      {getPairs().length < 10 ? `0${getPairs().length}` : getPairs().length}{" "}
      Pairs
    </Text>
  );
}

export default Pairs;
