import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";
import { Role } from "./types";

import PopOver from "./components/PopOver";

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [role, setRole] = useState<Role>(undefined);

  useEffect(() => {
    const initDashboardMaker = async () => {
      const roleValue = await OBR.player.getRole();
      setRole(roleValue);
      setAppIsReady(true);
    }

    OBR.onReady(() => {
      initDashboardMaker();
    });
  }, []);

  if (appIsReady) {
    return <PopOver role={role} />;
  } else {
    return (
      <>
        {OBR.isAvailable ? (
          <h1>Loading...</h1>
        ) : (
          <div id="no-owlbear">
            <PopOver standalone={true} role={role} />
          </div>
        )}
      </>
    );
  }
}
