import net from "net";
import { TCP_PORT, addPair, getPairs, removePair } from "../config.js";

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
      console.log("⚙ TCP server started", TCP_PORT());
    });

    tcpServer.socket.on("error", (err) => {
      console.error("❌ TCP error: ", err);
    });
  }

  static sendMessage(message: string) {
    const pairs = getPairs();
    if (pairs.length === 0) return;

    pairs.forEach((pair) => {
      pair.write(message);
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
    console.log("✅ Connected to " + socket.remoteAddress?.split(":").pop());
    socket.write("Hello world!");

    socket.on("data", (data) => {
      console.log(`${socket.remoteAddress?.split(":").pop()}: ${data}`);
    });

    socket.on("end", () => {
      console.log("❌ Client disconnected");
      removePair(socket.remoteAddress!);
    });

    socket.on("error", () => {
      console.log("❌ Client error");
      removePair(socket.remoteAddress!);
    });
    socket.on("timeout", () => {
      console.log("❌ Client timeout");
      removePair(socket.remoteAddress!);
    });

    addPair(socket);
  }
}
