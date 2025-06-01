import React from "react";
import { Box, Text } from "ink";
import InputText from "./components/organisms/InputText.js";
import ChatsBox from "./components/organisms/ChatsBox.js";
import Pairs from "./components/atoms/Pairs.js";
import UdpStatus from "./components/atoms/UdpStatus.js";
import TcpStatus from "./components/atoms/TcpStatus.js";

export default function App() {
  return (
    <>
      <Box
        margin={1}
        display="flex"
        flexDirection="row"
        width="100%"
        height="100%"
        rowGap={1}
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
        <Box
          flexGrow={1}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Box
            display="flex"
            flexDirection="column"
            flexGrow={1}
            marginX={1}
            borderStyle="round"
            borderColor="gray"
          >
            <Box justifyContent="center">
              <Text bold color={"yellowBright"}>
                Logs
              </Text>
            </Box>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            marginX={1}
            paddingX={1}
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
