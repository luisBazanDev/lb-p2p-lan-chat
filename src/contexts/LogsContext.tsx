export const Logs: string[] = [];
export const log = (log: string) => {
  Logs.push(log);
};
export const getLogs = () => {
  return [...Logs];
};
export const clearLogs = () => {
  Logs.splice(0, Logs.length);
};
