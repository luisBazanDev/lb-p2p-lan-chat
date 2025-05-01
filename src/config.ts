import net from "net";
import { select, number, input } from "@inquirer/prompts";
import Interfaces from "./services/Interfaces.js";

const config: {
  UDP_PORT: number;
  TCP_PORT: number;
  IP_ADDRESS: string | null;
  NETWORK: string | null;
  USERNAME: string | null;
  PAIRS: net.Socket[];
} = {
  UDP_PORT: 41234,
  TCP_PORT: 1288,
  IP_ADDRESS: null,
  NETWORK: null,
  PAIRS: [],
  USERNAME: null,
};

export async function configure() {
  const selectedInterface = await select({
    message: "Select the network interface",
    choices: Interfaces.getInterfaces().map((iface) => ({
      name: iface.address,
      value: iface,
    })),
  });
  config.IP_ADDRESS = selectedInterface.address;

  const UDP_PORT = await number({
    message: "Select the UDP port",
    default: config.UDP_PORT,
    min: 1024,
    max: 65535,
    required: true,
  });

  const TCP_PORT = await number({
    message: "Select the TCP port",
    default: config.TCP_PORT,
    min: 1024,
    max: 65535,
    required: true,
  });

  config.UDP_PORT = UDP_PORT;
  config.TCP_PORT = TCP_PORT;

  const USERNAME = await input({
    message: "Select your username",
    required: true,
    validate: (name) => {
      if (name.length < 3) {
        return "Username must be at least 3 characters long";
      }

      if (name.length > 30) {
        return "Username must be at most 20 characters long";
      }

      return true;
    },
  });

  config.USERNAME = USERNAME;
}

export const UDP_PORT = config.UDP_PORT;
export const TCP_PORT = config.TCP_PORT;
export const IP_ADDRESS = config.IP_ADDRESS;
export const NETWORK = config.NETWORK;
export const USERNAME = config.USERNAME;
export const addPair = (socket: net.Socket) => {
  config.PAIRS.push(socket);
};
export const getPair = (ip: string) => {
  return config.PAIRS.find((pair) => pair.remoteAddress === ip);
};
export const removePair = (ip: string) => {
  config.PAIRS = config.PAIRS.filter((pair) => pair.remoteAddress !== ip);
};
export const getPairs = () => config.PAIRS;
