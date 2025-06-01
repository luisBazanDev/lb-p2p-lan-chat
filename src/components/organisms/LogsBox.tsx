import React, { useEffect } from "react";
import { getLogs } from "../../contexts/LogsContext.js";
import { Text } from "ink";

function LogsBox() {
  const [logs, setLogs] = React.useState<
    { message: string; timestamp: number }[]
  >([]);
  const maxRows = process.stdout.rows - 10;
  const maxWidth = Math.floor(process.stdout.columns * 0.2 - 6);

  const printLogs: { message: string; timestamp: number }[] = [];

  for (let i = 0; i < maxRows && i < logs.length; i++) {
    const log = logs[logs.length - 1 - i] as {
      message: string;
      timestamp: number;
    };
    if (log.message.length <= maxWidth) {
      printLogs.push(log);
      continue;
    }
    const extraRowsUse = Math.floor(log.message.length / maxWidth);
    for (let j = 0; j < extraRowsUse + 1; j++) {
      printLogs.push({
        message: log.message.slice(j * maxWidth, (j + 1) * maxWidth),
        timestamp: log.timestamp,
      });
    }
    i += extraRowsUse;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...getLogs()]);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return printLogs.map((log, index) => (
    <Text color="white" key={index}>
      {log.message}
    </Text>
  ));
}

export default LogsBox;
