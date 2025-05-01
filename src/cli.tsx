#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./app.js";

const cli = meow(
  `
	Usage
	  $ lb-p2p-lan-chat
`,
  {
    importMeta: import.meta,
    flags: {
      name: {
        type: "string",
      },
    },
  }
);

console.log(cli.flags.name);

render(<App />);
