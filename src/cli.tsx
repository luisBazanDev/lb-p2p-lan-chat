#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./app.js";
import { configure } from "./config.js";
import UDPServer from "./services/udp.js";
import TCPServer from "./services/tcp.js";

meow(
  `
	Usage
	  $ lb-p2p-lan-chat
`,
  {
    importMeta: import.meta,
  }
);

// Handle uncaught exceptions
process.on("uncaughtException", function () {
  // Catch all uncaught exceptions
});

async function main() {
  await configure();
  await UDPServer.start();
  await TCPServer.start();

  render(<App />);
}

main();
