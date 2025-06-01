import React from "react";
import { Box, Text } from "ink";
import InputText from "./components/organisms/InputText.js";
import ChatsBox from "./components/organisms/ChatsBox.js";
import Pairs from "./components/atoms/Pairs.js";
import UdpStatus from "./components/atoms/UdpStatus.js";
import TcpStatus from "./components/atoms/TcpStatus.js";
import LogsBox from "./components/organisms/LogsBox.js";

export default function App() {
  return (
    <>
      <Box
        margin={1}
        display="flex"
        flexDirection="row"
        width="100%"
        height="100%"
      >
        <Box
          width="80%"
          height="100%"
          flexDirection="column"
          display="flex"
          justifyContent="flex-end"
        >
          <Box flexGrow={1} borderStyle="round" borderColor="gray">
            <ChatsBox />
          </Box>
          <InputText />
        </Box>
        <Box display="flex" flexGrow={1} flexDirection="column">
          <Box
            height={process.stdout.rows - 8}
            display="flex"
            flexDirection="column"
            paddingX={1}
            marginX={1}
            borderStyle="round"
            borderColor="gray"
          >
            <Box justifyContent="center">
              <Text bold color={"yellowBright"}>
                Logs
              </Text>
            </Box>
            <Box width="100%" display="flex" flexDirection="column-reverse">
              <LogsBox />
            </Box>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            paddingX={1}
            height={6}
            marginX={1}
            borderStyle="round"
            borderColor="gray"
          >
            <Box justifyContent="center">
              <Text bold color={"yellowBright"}>
                Status
              </Text>
            </Box>
            <Pairs />
            <UdpStatus />
            <TcpStatus />
          </Box>
        </Box>
      </Box>
    </>
  );
}
