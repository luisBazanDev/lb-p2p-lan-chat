import React, { useEffect, useState } from "react";
import { useInput, Text, Box } from "ink";
import { IP_ADDRESS, USERNAME } from "../../config.js";
import TCPServer from "../../services/tcp.js";
import Pairs from "../atoms/Pairs.js";
import UdpStatus from "../atoms/UdpStatus.js";
import TcpStatus from "../atoms/TcpStatus.js";

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

      if (inputa === "clear") {
        TCPServer.clearChat();
        setInput("");
        return;
      }

      // Check if the input is empty
      if (inputa.trim() === "") {
        return;
      }

      TCPServer.sendMessage(inputa);
      setInput("");
      return;
    }

    if (key.delete || key.backspace) {
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
        <Text color={"greenBright"}>{` ${USERNAME()}`}</Text>
        <Text color={"redBright"}>{" > "}</Text>
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
        <Text> | </Text>
        <UdpStatus />
        <Text> | </Text>
        <TcpStatus />
      </Box>
    </Box>
  );
}
