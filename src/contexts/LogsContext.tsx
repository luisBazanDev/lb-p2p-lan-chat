export const Logs: { message: string; timestamp: number }[] = [];
export const log = (log: string) => {
  Logs.push({
    message: log,
    timestamp: Date.now(),
  });
};
export const getLogs = () => {
  return [...Logs];
};
export const removeFirstLog = () => {
  if (Logs.length > 0) {
    Logs.shift();
  }
};
export const clearLogs = () => {
  Logs.splice(0, Logs.length);
};
