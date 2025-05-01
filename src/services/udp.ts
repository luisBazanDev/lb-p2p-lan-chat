import dgram from "node:dgram";
import { getPair, UDP_PORT } from "../config.js";
import Interfaces from "./Interfaces.js";
import { UDPMessageType } from "../types/udp.js";

export default class UDPServer {
  private declare socket: dgram.Socket | null;
  declare static instance: UDPServer;

  constructor() {
    if (UDPServer.instance) {
      return UDPServer.instance;
    }

    UDPServer.instance = this;

    this.socket = null;
  }

  private static onMessage(msg: Buffer, rinfo: dgram.RemoteInfo) {
    const message = msg.toString();
    const ip = rinfo.address;

    // Filter if internal
    if (message === UDPMessageType.DISCOVER) {
      if (
        Interfaces.getInterfaces()
          .map((x) => x.address)
          .includes(ip)
      )
        return;

      // Filter if ready connected
      if (getPair(ip)) return;

      // Connect to the client
      // TODO: Connect tcp socket
      console.log("Connecting to client: ", ip);
    }
  }

  private static registerListeners(udpServer: UDPServer) {
    udpServer.socket?.on("error", (err) => {
      console.error("❌ UDP error: ", err);
    });

    udpServer.socket?.on("message", this.onMessage);
  }

  /**
   * Start the UDP server and bind it to the UDP_PORT
   */
  static async start() {
    const udpServer = new UDPServer();
    udpServer.socket = dgram.createSocket("udp4");
    udpServer.socket.bind(UDP_PORT, () => {
      udpServer.socket?.setBroadcast(true);
      console.log("⚙ UDP server started");
    });

    this.registerListeners(udpServer);
  }

  /**
   * Send a message to the UDP server
   * @param message Message to send
   * @returns false if the message could not be sent
   */
  static async sendMessage(message: string): Promise<boolean> {
    const udpServer = new UDPServer();
    if (!udpServer.socket) return false;

    try {
      udpServer.socket.send(message, UDP_PORT);
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  static async stop() {
    new UDPServer().socket?.close();
    new UDPServer().socket = null;
  }
}
