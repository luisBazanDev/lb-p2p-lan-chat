import React, { useEffect, useState } from "react";
import { useInput, Text, Box, useStdout } from "ink";
import { IP_ADDRESS, USERNAME } from "../../config.js";
import TCPServer from "../../services/tcp.js";
import HTTPServer from "../../services/http.js";
import { exitFullScreen } from "../FullScreen.js";

export default function InputText() {
  const { stdout } = useStdout();
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
        exitFullScreen();
        return;
      }

      if (inputa === "clear") {
        TCPServer.clearChat();
        setInput("");
        return;
      }

      // Handle /remote command
      if (inputa.startsWith("/remote ")) {
        const parts = inputa.slice(8).split(" ");
        const protocol = parts[0];
        const url = parts.slice(1).join(" ");

        if (!protocol || !url) {
          console.error(
            "Usage: /remote <protocol> <url>"
          );
          setInput("");
          return;
        }

        HTTPServer.getInstance()
          .connect(protocol, url)
          .catch(() => {
            // Error already logged and added to chat
          });

        setInput("");
        return;
      }

      // Handle /disconnect command
      if (inputa === "/disconnect") {
        HTTPServer.getInstance()
          .disconnect()
          .catch(() => {
            // Error already logged and added to chat
          });

        setInput("");
        return;
      }

      // Check if the input is empty
      if (inputa.trim() === "") {
        return;
      }

      // Check if it's a command
      if (inputa.startsWith("/")) {
        console.error(
          "Unknown command. Available commands: /remote <protocol> <url>, /disconnect, /clear, /exit"
        );
        setInput("");
        return;
      }

      // Send message to all connected nodes (TCP and HTTP)
      TCPServer.sendMessage(inputa);

      const httpServer = HTTPServer.getInstance();
      if (httpServer.isRemoteConnected()) {
        httpServer.sendMessage(inputa).catch(() => {
          // Error already logged
        });
      }

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

  const ipAddress = IP_ADDRESS() as string;
  const username = USERNAME() as string;
  const maxInputLength =
    stdout.columns * 0.8 - 12 - ipAddress.length - username.length;

  return (
    <Box width="100%" borderStyle="round" borderColor="green">
      <Text color={"gray"}>{`(${ipAddress})`}</Text>
      <Text color={"greenBright"}>{` ${username}`}</Text>
      <Text color={"redBright"}>{" > "}</Text>
      <Box
        flexGrow={1}
        flexDirection="row"
        display="flex"
        height={1}
        overflow="hidden"
      >
        {/* Cursor start */}
        {isCursorVisible && inputa === "" ? (
          <Text color={"white"}>|</Text>
        ) : (
          <Text color={"white"}> </Text>
        )}
        {inputa === "" ? (
          <Text color={"grey"}>Type your message or 'exit' to end</Text>
        ) : (
          <Text color={"white"} wrap="truncate-start">
            {inputa.length > maxInputLength
              ? `${inputa.slice(inputa.length - maxInputLength)}`
              : inputa}
          </Text>
        )}
        {isCursorVisible && inputa !== "" && <Text color={"white"}>|</Text>}
      </Box>
    </Box>
  );
}
