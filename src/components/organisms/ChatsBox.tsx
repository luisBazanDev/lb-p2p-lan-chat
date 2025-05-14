import React, { useCallback, useEffect, useState } from "react";
import { Box, Text } from "ink";
import { getChats } from "../../contexts/ChatContext.js";
import { TCPMessageMessagePayload } from "../../types/tcp.js";
import { INITIAL_TTL } from "../../config.js";

function ChatsBox() {
  const [chats, setChats] = useState([] as TCPMessageMessagePayload[]);
  const chatsHandler = useCallback(() => {}, [chats]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChats([...getChats()]);
    }, 100);

    return () => clearInterval(interval);
  }, [chatsHandler]);

  return (
    <Box display="flex" flexDirection="column" marginBottom={1} height={-1}>
      <Box marginBottom={1}>
        <Text color="green">Chat Box | {chats.length} messages</Text>
      </Box>
      {chats.map((chat) =>
        chat.system ? (
          <SystemChat chat={chat} key={chat.uuid} />
        ) : (
          <Chat chat={chat} key={chat.uuid} />
        )
      )}
    </Box>
  );
}

function Chat({ chat }: { chat: TCPMessageMessagePayload }) {
  return (
    <Box>
      <Text color={"gray"}>{`(${chat.ttl} ttl) `}</Text>
      <Text
        color={
          chat.ttl === INITIAL_TTL
            ? "greenBright"
            : chat.ttl === INITIAL_TTL - 1
            ? "blueBright"
            : "redBright"
        }
      >
        {chat.username}
      </Text>
      <Text color="gray">{`: `}</Text>
      <Text color="white">{`${chat.message}`}</Text>
    </Box>
  );
}

function SystemChat({ chat }: { chat: TCPMessageMessagePayload }) {
  return (
    <Box>
      <Text color={"gray"}>{`(system) `}</Text>
      <Text color="white">{`${chat.message}`}</Text>
    </Box>
  );
}

export default ChatsBox;
