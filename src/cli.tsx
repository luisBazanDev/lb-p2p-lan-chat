#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./app.js";
import { configure } from "./config.js";
import UDPServer from "./services/udp.js";

meow(
  `
	Usage
	  $ lb-p2p-lan-chat
`,
  {
    importMeta: import.meta,
  }
);

async function main() {
  await configure();
  await UDPServer.start();

  render(<App />);
}

main();
