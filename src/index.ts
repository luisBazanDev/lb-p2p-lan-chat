// server.js
import dgram from "node:dgram";
import net from "node:net";
import os from "node:os";

import { select, input } from "@inquirer/prompts";

const pairs: string[] = [];

let CONFIG: {
  UDP_PORT: number;
  TCP_PORT: number;
  IP_ADDRESS: string | null;
  NETWORK: string | null;
} = {
  UDP_PORT: 41234,
  TCP_PORT: 1288,
  IP_ADDRESS: null,
  NETWORK: null,
};

const udpServer = dgram.createSocket("udp4");

const tcpServer = net.createServer((socket) => {
  console.log(`✅ Client connected: ${socket.remoteAddress}`);
  socket.on("data", (data) => {
    console.log(`📨 Received: ${data}`);
    socket.write(`Echo: ${data}`);
  });
  socket.on("end", () => console.log("❌ Client disconnected"));
});

function getInterfaces() {
  const interfaces = os.networkInterfaces();

  const result: os.NetworkInterfaceInfo[] = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] as os.NetworkInterfaceInfo[]) {
      if (iface.family === "IPv4") {
        result.push(iface);
      }
    }
  }

  return result;
}

async function readChat() {
  const message = await input({
    message: "(you) > ",
    required: true,
  });

  if (message === "exit") {
    console.log("👋 Goodbye!");
    process.exit(0);
  }

  pairs.forEach((pair) => {
    udpServer.send(Buffer.from(message), CONFIG.UDP_PORT, pair);
  });

  readChat();
}

(async () => {
  const selectIndex = await select({
    message: "Select an interface",
    choices: getInterfaces().map((iface, index) => {
      return {
        name: `${iface.family} ${iface.address} ${
          iface.internal ? "(internal)" : ""
        }`,
        value: index,
      };
    }),
    default: 0,
  });

  CONFIG.IP_ADDRESS = getInterfaces()[selectIndex].address;

  if (!CONFIG.IP_ADDRESS) {
    console.error("No address found");
    process.exit(1);
  }

  udpServer.bind(CONFIG.UDP_PORT, () => {
    udpServer.setBroadcast(true);
    console.log(`📡 UDP discovery server listening on port ${CONFIG.UDP_PORT}`);
  });

  tcpServer.listen(CONFIG.TCP_PORT, () => {
    console.log(`🚀 TCP server listening on port ${CONFIG.TCP_PORT}`);
  });

  setTimeout(() => {
    console.log(
      "💬 Type your message and hit enter to send it to all clients."
    );
    readChat();
  }, 1000);
})();

udpServer.on("message", (msg, rinfo) => {
  if (
    getInterfaces()
      .map((x) => x.address)
      .includes(rinfo.address)
  )
    return;
  console.log(`🔍 Discovery ping from ${rinfo.address}`);
  const response = Buffer.from(`tcp://${CONFIG.IP_ADDRESS}:${CONFIG.TCP_PORT}`);
  udpServer.send(response, rinfo.port, rinfo.address);
});

udpServer.on("message", (msg, rinfo) => {
  if (
    getInterfaces()
      .map((x) => x.address)
      .includes(rinfo.address)
  )
    return;

  const ip = rinfo.address;

  console.log(`${ip} > ${msg}`);

  const client = net.createConnection(
    { host: ip, port: CONFIG.TCP_PORT },
    () => {
      console.log("✅ Connected to " + ip);
      client.write("Hello from client!");
    }
  );

  client.on("data", (data) => {
    console.log(`📨 Received: ${data}`);
  });

  client.on("end", () => {
    console.log("❌ Disconnected from server");
  });

  client.on("error", (err) => {
    console.error(`⚠️ TCP error: ${err.message}`);
  });
});

// Discover new clients every 5 seconds
setInterval(() => {
  if (!CONFIG.IP_ADDRESS) return;

  const message = Buffer.from("discover");
  udpServer.send(
    message,
    0,
    message.length,
    CONFIG.UDP_PORT,
    "255.255.255.255",
    () => {
      // console.log("🔍 Sent discovery message");
    }
  );
}, 5000);
