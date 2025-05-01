import os from "os";

export default class Interfaces {
  static getInterfaces() {
    const interfaces = os.networkInterfaces();

    const result: os.NetworkInterfaceInfo[] = [];

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] as os.NetworkInterfaceInfo[]) {
        if (iface.family === "IPv4") {
          result.push(iface);
        }
      }
    }

    return result;
  }
}
