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
process.on("uncaughtException", function (err) {
  // Catch all uncaught exceptions
  console.error("❌ Uncaught Exception: ", err);
});

async function main() {
  console.log(`
  _      ____    _____ ___  _____    _               _   _    _____ _    _       _______ 
 | |    |  _ \\  |  __ \\__ \\|  __ \\  | |        /\\   | \\ | |  / ____| |  | |   /\\|__   __|
 | |    | |_) | | |__) | ) | |__) | | |       /  \\  |  \\| | | |    | |__| |  /  \\  | |   
 | |    |  _ <  |  ___/ / /|  ___/  | |      / /\\ \\ | . \` | | |    |  __  | / /\\ \\ | |   
 | |____| |_) | | |    / /_| |      | |____ / ____ \\| |\\  | | |____| |  | |/ ____ \\| |   
 |______|____/  |_|   |____|_|      |______/_/    \\_\\_| \\_|  \\_____|_|  |_/_/    \\_\\_|
 `);
  await configure();
  await UDPServer.start();
  await TCPServer.start();

  render(<App />);
}

main();
