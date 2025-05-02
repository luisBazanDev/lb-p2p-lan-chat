import net from "net";
import {
  TCPMessage,
  TCPMessageHelloPayload,
  TCPMessageMessagePayload,
  TCPMessageType,
} from "../types/tcp.js";
import { addChat } from "../contexts/ChatContext.js";
import { getPairs, INITIAL_TTL } from "../config.js";
import PaisContext from "../contexts/PairsContext.js";
import { randomUUID } from "crypto";

const sessionChats: string[] = [];
const MAX_SESSION_CHAT = 1000;

export async function onTcpHello(
  socket: net.Socket,
  payload: TCPMessageHelloPayload
) {
  const ip = socket.remoteAddress!;
  const username = payload.username;

  // Register pair
  PaisContext.addPair({
    ip: ip,
    username: username,
    timestamp: Date.now(),
  });

  // Register message as system message
  addChat({
    username: username,
    message: `👋 ${username} join to the chat from ${ip}`,
    uuid: randomUUID(),
    ttl: INITIAL_TTL,
    system: true,
  });
}

export async function onTcpMessage(
  socket: net.Socket,
  payload: TCPMessageMessagePayload
) {
  // Filter if the message already exists in the session
  if (sessionChats.includes(payload.uuid)) {
    return;
  }

  // Add the message to the session
  addChat(payload);
  sessionChats.push(payload.uuid);

  if (sessionChats.length > MAX_SESSION_CHAT) {
    sessionChats.shift();
  }

  // Discard the message if the TTL is less than 1
  if (payload.ttl <= 1) return;

  // Reply message to pairs
  const messagePackage: TCPMessage = {
    type: TCPMessageType.MESSAGE,
    payload: {
      uuid: payload.uuid,
      username: payload.username,
      message: payload.message,
      ttl: payload.ttl - 1,
    },
  };
  getPairs().forEach((pair) => {
    // Filter if the message is from the same user
    if (pair.remoteAddress === socket.remoteAddress) return;

    pair.write(JSON.stringify(messagePackage));
  });
}
