// server.js
import dgram from "node:dgram";
import net from "node:net";
import os from "node:os";
import readline from "readline";

import { select, input } from "@inquirer/prompts";

const pairs: net.Socket[] = [];

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

const tcpServer = net.createServer(async (socket) => {
  console.log(`✅ Client connected: ${socket.remoteAddress?.split(":").pop()}`);
  socket.on("data", (data) => {
    safeLog(`${socket.remoteAddress?.split(":").pop()}: ${data}`);
  });
  socket.on("end", () => console.log("❌ Client disconnected"));
  pairs.push(socket);
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

function clearPromptLine() {
  readline.clearLine(process.stdout, 0); // Limpia la línea actual
  readline.cursorTo(process.stdout, 0); // Mueve el cursor al inicio
}

function safeLog(message: string) {
  clearPromptLine();
  console.log(message);
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
    pair.write(message);
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
  const ip = rinfo.address;

  // Filter if internal
  if (
    getInterfaces()
      .map((x) => x.address)
      .includes(ip)
  )
    return;

  // Filter if ready connected
  if (pairs.map((x) => x.remoteAddress?.split(":").pop()).includes(ip)) return;

  safeLog(`${ip} > ${msg}`);

  const client = net.createConnection(
    { host: ip, port: CONFIG.TCP_PORT },
    () => {
      console.log("✅ Connected to " + ip);
      client.write("Hello from client!");
    }
  );

  pairs.push(client);

  client.on("data", (data) => {
    console.log(`${ip}: ${data}`);
  });

  client.on("end", () => {
    pairs.splice(pairs.indexOf(client), 1);
  });

  client.on("error", (err) => {
    pairs.splice(pairs.indexOf(client), 1);
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
