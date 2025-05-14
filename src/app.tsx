import React from "react";
import { Box } from "ink";
import InputText from "./components/organisms/InputText.js";
import ChatsBox from "./components/organisms/ChatsBox.js";

export default function App() {
  return (
    <>
      <Box
        margin={1}
        display="flex"
        flexDirection="column"
        width="100%"
        height={-1}
      >
        <ChatsBox />
        <InputText />
      </Box>
    </>
  );
}
