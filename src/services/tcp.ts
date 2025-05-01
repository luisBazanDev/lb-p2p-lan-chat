import net from "net";
import { TCP_PORT, addPair, getPairs } from "../config.js";

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

  private static onConnection(socket: net.Socket) {
    this.registerSocket(socket);
  }

  static start() {
    const tcpServer = new TCPServer();
    tcpServer.socket = net.createServer(this.onConnection);

    tcpServer.socket.listen(TCP_PORT, () => {
      console.log("⚙ TCP server started");
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
    const client = net.createConnection({ host: ip, port: TCP_PORT });

    this.registerSocket(client);
  }

  private static registerSocket(socket: net.Socket) {
    socket.on("connect", () => {
      console.log("✅ Connected to " + socket.remoteAddress);
      socket.write("Hello world!");
    });

    socket.on("data", (data) => {
      console.log(`${socket.remoteAddress}: ${data}`);
    });
    socket.on("end", () => {
      console.log("❌ Client disconnected");
    });

    addPair(socket);
  }
}
