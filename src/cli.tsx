#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./app.js";
import { configure } from "./config.js";

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

  render(<App />);
}

main();
