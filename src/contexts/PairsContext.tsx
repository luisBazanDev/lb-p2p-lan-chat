const pairs: {
  ip: string;
  username: string;
  timestamp: number;
}[] = [];

export default {
  addPair: (pair: { ip: string; username: string; timestamp: number }) => {
    pairs.push(pair);
  },
  getPairs: () => {
    return pairs;
  },
  removePair: (ip: string) => {
    const index = pairs.findIndex((pair) => pair.ip === ip);
    if (index > -1) {
      pairs.splice(index, 1);
    }
  },
};
