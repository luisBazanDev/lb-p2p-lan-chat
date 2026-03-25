import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { getChats } from "../../contexts/ChatContext.js";
import { TCPMessageMessagePayload } from "../../types/tcp.js";
import { INITIAL_TTL } from "../../config.js";

function ChatsBox() {
  const [chats, setChats] = useState([] as TCPMessageMessagePayload[]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChats(getChats());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Calcular altura disponible para mensajes
  // Altura total - margen(2) - header del chat(2) - InputText(3) - bordes(2) = rows - 9
  const availableHeight = Math.max(1, process.stdout.rows - 9);
  
  // Mostrar solo los últimos mensajes que caben en pantalla
  const visibleChats = chats.slice(Math.max(0, chats.length - availableHeight));

  return (
    <Box
      display="flex"
      flexDirection="column"
      marginBottom={1}
      height="100%"
      width="100%"
      overflow="hidden"
    >
      <Box marginBottom={1} width="100%" justifyContent="center" display="flex">
        <Text color="white" bold>
          LB-P2P-LAN-CHAT
        </Text>
        <Text color="greenBright">v0.1.0</Text>
        <Text color="gray"> | {chats.length} messages</Text>
      </Box>
      <Box flexDirection="column" justifyContent="flex-end">
        {visibleChats.map((chat) =>
          chat.system ? (
            <SystemChat chat={chat} key={chat.uuid} />
          ) : (
            <Chat chat={chat} key={chat.uuid} />
          )
        )}
      </Box>
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
