import { Box } from "ink";
import React, { useEffect, useState } from "react";

const enterAltScreenCommand = "\x1b[?1049h";
const leaveAltScreenCommand = "\x1b[?1049l";

const exitFullScreen = () => {
  process.stdout.write(leaveAltScreenCommand);
  process.exit(0);
};

const FullScreen = ({ children }: { children: React.JSX.Element }) => {
  const [size, setSize] = useState({
    columns: process.stdout.columns,
    rows: process.stdout.rows,
  });

  useEffect(() => {
    function onResize() {
      setSize({
        columns: process.stdout.columns,
        rows: process.stdout.rows,
      });
    }

    process.stdout.on("resize", onResize);
    process.stdout.write(enterAltScreenCommand);
    return () => {
      process.stdout.off("resize", onResize);
      process.stdout.write(leaveAltScreenCommand);
    };
  }, []);

  return (
    <Box
      height={size.rows}
      width={size.columns}
      borderColor={"green"}
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="stretch"
    >
      {children}
    </Box>
  );
};

export { exitFullScreen };
export default FullScreen;
