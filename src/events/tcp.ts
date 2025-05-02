import net from "net";
import {
  TCPMessageHelloPayload,
  TCPMessageMessagePayload,
} from "../types/tcp.js";

export async function onTcpHello(
  socket: net.Socket,
  payload: TCPMessageHelloPayload
) {
  const ip = socket.remoteAddress!;
  const username = payload.username;

  // TODO: Register message as system message
  console.log(`👋 ${username} join to the chat from ${ip}`);
}

export async function onTcpMessage(
  socket: net.Socket,
  payload: TCPMessageMessagePayload
) {
  console.log(
    `💬 ${payload.username}: ${payload.message} (${
      payload.uuid
    } ${socket.remoteAddress!})`
  );

  // TODO: Reply message to pairs
}
