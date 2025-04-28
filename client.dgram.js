// client.js
import dgram from "node:dgram";
import net from "node:net";

const UDP_PORT = 41234;
const udpClient = dgram.createSocket("udp4");

udpClient.bind(() => {
  udpClient.setBroadcast(true);

  // 📡 Enviar broadcast
  const message = Buffer.from("discover");
  udpClient.send(
    message,
    0,
    message.length,
    UDP_PORT,
    "255.255.255.255",
    () => {
      console.log("🔍 Sent discovery message");
    }
  );
});

// 🛬 Esperar respuesta y conectar vía TCP
udpClient.on("message", (msg, rinfo) => {
  console.log(`📥 Server found at: ${msg}`);
  udpClient.close();

  const [_, ip, port] = msg.toString().match(/tcp:\/\/(.+):(\d+)/);
  const client = net.createConnection(
    { host: ip, port: parseInt(port) },
    () => {
      console.log("✅ Connected to server");
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
