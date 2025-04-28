import net from "node:net";

const server = net.createServer((socket) => {
  console.log("Client connected");
  console.log(socket);

  socket.on("data", (data) => {
    console.log(`Received data: ${data}`);
    socket.write(data);
  });

  socket.on("error", (err) => {
    console.error(`Socket error: ${err}`);
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });
});

server.listen(1288, () => {
  console.log("Server listening on port 1288");
});
