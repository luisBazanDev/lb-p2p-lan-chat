import net from "node:net";

const client = net.createConnection(
  { port: 1288, host: "255.255.255.255" },
  () => {
    console.log("Connected to server");
    client.write("Hello from client!");
  }
);

client.on("data", (data) => {
  console.log(`Received: ${data.toString()}`);
  client.end();
});

client.on("end", () => {
  console.log("Disconnected from server");
});

client.on("error", (err) => {
  console.error(`Socket error: ${err}`);
});
