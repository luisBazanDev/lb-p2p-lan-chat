// server.js
import dgram from "node:dgram";
import net from "node:net";
import os from "node:os";

const UDP_PORT = 41234;
const TCP_PORT = 1288;
const udpServer = dgram.createSocket("udp4");

// ✅ Devuelve la IP local (no '127.0.0.1')
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      console.log(iface.cidr);
      if (!`${iface.address}`.startsWith("10")) continue; // Ignorar interfaces internas
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

// 🔊 Servidor UDP escucha y responde con su IP
udpServer.on("message", (msg, rinfo) => {
  console.log(`🔍 Discovery ping from ${rinfo.address}`);
  const response = Buffer.from(`tcp://${getLocalIP()}:${TCP_PORT}`);
  udpServer.send(response, rinfo.port, rinfo.address);
});

udpServer.bind(UDP_PORT, () => {
  udpServer.setBroadcast(true);
  console.log(`📡 UDP discovery server listening on port ${UDP_PORT}`);
});

// 🌐 Servidor TCP principal
const tcpServer = net.createServer((socket) => {
  console.log(`✅ Client connected: ${socket.remoteAddress}`);
  socket.on("data", (data) => {
    console.log(`📨 Received: ${data}`);
    socket.write(`Echo: ${data}`);
  });
  socket.on("end", () => console.log("❌ Client disconnected"));
});

tcpServer.listen(TCP_PORT, () => {
  console.log(`🚀 TCP server listening on port ${TCP_PORT}`);
});
