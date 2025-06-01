import dgram from "node:dgram";
import { getPair, getPairs, IP_ADDRESS, UDP_PORT } from "../config.js";
import Interfaces from "./Interfaces.js";
import { UDPMessageType } from "../types/udp.js";
import TCPServer from "./tcp.js";
import { log } from "../contexts/LogsContext.js";

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
      TCPServer.connect(ip);
    }
  }

  private static registerListeners(udpServer: dgram.Socket) {
    udpServer.on("error", (err) => {
      log("UDP error: " + err.message);
    });

    udpServer.on("message", this.onMessage);
  }

  /**
   * Start the UDP server and bind it to the UDP_PORT
   */
  static async start() {
    const udpServer = new UDPServer();
    udpServer.socket = dgram.createSocket("udp4");

    udpServer.socket.bind(UDP_PORT(), () => {
      udpServer.socket?.setBroadcast(true);
      log("✔ UDP server started");
    });

    // Set the socket to broadcast
    const discoverClients = () => {
      if (!udpServer.socket) return;
      udpServer.socket.send(
        Buffer.from(UDPMessageType.DISCOVER),
        0,
        UDPMessageType.DISCOVER.length,
        UDP_PORT(),
        "255.255.255.255"
      );
    };

    let udpDiscoverCycle = 0;

    setInterval(() => {
      if (!IP_ADDRESS) return;
      udpDiscoverCycle++;

      // If less than 3 clients, discover
      // If less than 10 clients, discover every 25 seconds
      if (getPairs().length <= 3) discoverClients();
      else if (getPairs().length <= 10 && udpDiscoverCycle % 5 === 0)
        discoverClients();

      // Else stop discovering
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
      log("Error sending message:" + error);
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
