import { TCPMessageMessagePayload } from "../types/tcp.js";

export const Chats: TCPMessageMessagePayload[] = [];
export const addChat = (chat: TCPMessageMessagePayload) => {
  Chats.push(chat);
};
export const getChats = () => {
  return Chats;
};
