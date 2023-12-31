import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

import PopOver from "./components/PopOver";

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    OBR.onReady(() => {
      setAppIsReady(true);
    });
  }, []);

  if (appIsReady) {
    return <PopOver />;
  } else {
    return (
      <>
        {OBR.isAvailable ? (
          <h1>Loading...</h1>
        ) : (
          <div id="no-owlbear">
            <PopOver />
          </div>
        )}
      </>
    );
  }
}
