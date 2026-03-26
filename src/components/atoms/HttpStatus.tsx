import React, { useEffect, useState } from "react";
import { Text } from "ink";
import HTTPServer from "../../services/http.js";

function HttpStatus() {
  const [remoteInfo, setRemoteInfo] = useState<{
    baseUrl: string;
    token: string | null;
  } | null>(null);

  useEffect(() => {
    // Check connection status every second
    const interval = setInterval(() => {
      const info = HTTPServer.getInstance().getRemoteInfo();
      setRemoteInfo(info);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!remoteInfo) {
    return <Text color={"gray"}>HTTP: not connected</Text>;
  }

  return (
    <Text color={"cyanBright"}>
      HTTP: connected to {remoteInfo.baseUrl}
    </Text>
  );
}

export default HttpStatus;
