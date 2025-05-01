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
import { TCPMessageMessagePayload, TCPMessageType } from "../types/tcp.js";
import { randomUUID } from "crypto";
import { onTcpHello, onTcpMessage } from "../events/tcp.js";

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
    const messagePackage: TCPMessageMessagePayload = {
      message: message,
      username: USERNAME()!,
      uuid: randomUUID(),
      ttl: INITIAL_TTL,
    };

    // TODO: Register message on the local chat

    // Send the message to all connected pairs
    pairs.forEach((pair) => {
      pair.write(
        JSON.stringify({
          type: TCPMessageType.MESSAGE,
          payload: messagePackage,
        })
      );
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

  private static registerSocket(socket: net.Socket) {
    // Prevent double connections between pairs
    if (getPair(socket.remoteAddress!)) {
      socket.destroy();
      return;
    }

    // TODO: remove this console log
    console.log("✅ Connected to " + socket.remoteAddress?.split(":").pop());

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
        console.log("❌ Client disconnected");
        removePair(socket.remoteAddress!);
      }
    });

    socket.on("error", () => {
      if (getPair(socket.remoteAddress!)) {
        console.log("❌ Client disconnected");
        removePair(socket.remoteAddress!);
      }
    });
    socket.on("timeout", () => {
      if (getPair(socket.remoteAddress!)) {
        console.log("❌ Client disconnected");
        removePair(socket.remoteAddress!);
      }
    });

    addPair(socket);
  }
}
