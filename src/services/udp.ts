import dgram from "node:dgram";
import { getPair, UDP_PORT } from "../config.js";
import Interfaces from "./Interfaces.js";
import { UDPMessageType } from "../types/udp.js";

export default class UDPServer {
  private declare socket: dgram.Socket | null;
  declare static instance: UDPServer;
  private declare interval: NodeJS.Timeout | null;

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
    console.log("UDP message received: ", msg.toString(), ip);

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

  private static registerListeners(udpServer: dgram.Socket) {
    udpServer.on("error", (err) => {
      console.error("❌ UDP error: ", err);
    });

    udpServer.on("message", this.onMessage);
  }

  /**
   * Start the UDP server and bind it to the UDP_PORT
   */
  static async start() {
    const udpServer = new UDPServer();
    console.log("Starting UDP server...");
    udpServer.socket = dgram.createSocket("udp4");

    udpServer.socket.bind(UDP_PORT, () => {
      udpServer.socket?.setBroadcast(true);
      console.log("⚙ UDP server started");
    });

    // Set the socket to broadcast
    udpServer.interval = setInterval(() => {
      if (!udpServer.socket) return;
      udpServer.socket.send(UDPMessageType.DISCOVER, UDP_PORT);
    }, 5000);

    this.registerListeners(udpServer.socket);
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
    const instance = new UDPServer();
    instance.socket?.close();
    instance.socket = null;
    if (instance.interval) {
      clearInterval(instance.interval);
      instance.interval = null;
    }
  }
}
