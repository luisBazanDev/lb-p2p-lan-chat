import React, { useEffect, useState } from "react";
import { useInput, Text, Box } from "ink";
import { IP_ADDRESS, USERNAME } from "../../config.js";
import TCPServer from "../../services/tcp.js";
import Pairs from "../atoms/Pairs.js";

export default function InputText() {
  const [inputa, setInput] = useState("");
  const [isCursorVisible, setIsCursorVisible] = useState(true);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsCursorVisible((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(blinkInterval);
    };
  }, []);

  useInput((input, key) => {
    if (key.return) {
      if (inputa === "exit") {
        process.exit(0);
      }
      // TODO if inputa is empty, do not send message
      TCPServer.sendMessage(inputa);
      setInput("");
      return;
    }

    if (key.delete) {
      setInput((prev) => prev.slice(0, -1));
      return;
    } else {
      setInput((prev) => prev + input);
    }
  });

  return (
    <Box width="100%">
      <Box width={80}>
        <Text color={"gray"}>{`(${IP_ADDRESS()})`}</Text>
        <Text color={"green"}>{` ${USERNAME()}`}</Text>
        <Text color={"red"}>{" > "}</Text>
        <Box width={50}>
          <Text wrap="truncate-start">
            {isCursorVisible && inputa === "" ? (
              <Text color={"white"}>|</Text>
            ) : (
              " "
            )}
            {inputa === "" ? (
              <Text color={"grey"}>Type your message or 'exit' to end</Text>
            ) : (
              inputa
            )}
            {isCursorVisible && inputa !== "" && <Text color={"white"}>|</Text>}
          </Text>
        </Box>
      </Box>
      <Box>
        <Text> | </Text>
        <Pairs />
      </Box>
    </Box>
  );
}
