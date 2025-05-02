import net from "net";
import {
  INITIAL_TTL,
  TCP_PORT,
  USERNAME,
  addPair,
  getPair,
  getPairs,
  removePair,
} from "../config.js";
import { TCPMessage, TCPMessageType } from "../types/tcp.js";
import { randomUUID } from "crypto";
import { onTcpHello, onTcpMessage } from "../events/tcp.js";
import { addChat } from "../contexts/ChatContext.js";
import PairsContext from "../contexts/PairsContext.js";

export default class TCPServer {
  private declare socket: net.Server | null;
  declare static instance: TCPServer;

  constructor() {
    if (TCPServer.instance) {
      return TCPServer.instance;
    }

    TCPServer.instance = this;

    this.socket = null;
  }

  static start() {
    const tcpServer = new TCPServer();
    tcpServer.socket = net.createServer(this.registerSocket);

    tcpServer.socket.listen(TCP_PORT(), () => {
      console.log("✅ TCP server started", TCP_PORT());
    });

    tcpServer.socket.on("error", (err) => {
      console.error("❌ TCP error: ", err);
    });
  }

  static sendMessage(message: string) {
    const pairs = getPairs();
    if (pairs.length === 0) return;

    // Build the message package
    const messagePackage: TCPMessage = {
      type: TCPMessageType.MESSAGE,
      payload: {
        message: message,
        username: USERNAME()!,
        uuid: randomUUID(),
        ttl: INITIAL_TTL - 1,
      },
    };

    // Register self message as user message
    addChat({
      message: message,
      username: USERNAME()!,
      uuid: randomUUID(),
      ttl: INITIAL_TTL,
    });

    // Send the message to all connected pairs
    pairs.forEach((pair) => {
      pair.write(JSON.stringify(messagePackage));
    });
  }

  static connect(ip: string) {
    try {
      const client = net.createConnection({ host: ip, port: TCP_PORT() }, () =>
        this.registerSocket(client)
      );
    } catch (err) {
      return;
    }
  }

  static disconnect(ip: string) {
    const pair = getPair(ip);
    if (!pair) return;

    pair.destroy();
    removePair(ip);

    if (PairsContext.getPairs().findIndex((x) => x.ip === ip) === -1) return;

    // Register message as system message
    addChat({
      username: PairsContext.getPairs().find((x) => x.ip === ip)?.username!,
      message: `👋 ${
        PairsContext.getPairs().find((x) => x.ip === ip)?.username
      } left the chat from ${ip.split(":").pop()}`,
      uuid: randomUUID(),
      ttl: INITIAL_TTL,
      system: true,
    });

    // Remove pair from context
    PairsContext.removePair(ip);
  }

  private static registerSocket(socket: net.Socket) {
    // Prevent double connections between pairs
    if (getPair(socket.remoteAddress!)) {
      socket.destroy();
      return;
    }

    // Send hello message
    socket.write(
      JSON.stringify({
        type: TCPMessageType.HELLO,
        payload: {
          username: USERNAME(),
        },
      })
    );

    socket.on("data", (data) => {
      try {
        const message = JSON.parse(data.toString());
        const type = message.type as TCPMessageType;

        switch (type) {
          case TCPMessageType.HELLO:
            onTcpHello(socket, message.payload);
            break;
          case TCPMessageType.MESSAGE:
            onTcpMessage(socket, message.payload);
            break;
        }
      } catch (err) {}
    });

    socket.on("end", () => {
      if (getPair(socket.remoteAddress!)) {
        TCPServer.disconnect(socket.remoteAddress!);
      }
    });

    socket.on("error", () => {
      if (getPair(socket.remoteAddress!)) {
        TCPServer.disconnect(socket.remoteAddress!);
      }
    });
    socket.on("timeout", () => {
      if (getPair(socket.remoteAddress!)) {
        TCPServer.disconnect(socket.remoteAddress!);
      }
    });

    addPair(socket);
  }
}
