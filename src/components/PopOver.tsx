import localforage from 'localforage';
import { useEffect, useState, useCallback, useRef } from 'react';
import Dashboard from './Dashboard';
import styles from '../styles/PopOver.module.css';
import refresh from "../assets/refresh.svg";

export default function PopOver() {
  const [selectedDashboard, setSelectedDashboard] = useState('');
  const [dashBoardsArray, setDashboardsArray] = useState<string[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const newDashInput = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const initDashboards = async () => {
      const keys = await localforage.keys();
      setDashboardsArray(keys);
    };

    initDashboards();
    console.log('Dashboards Refreshed');
  }, [refreshCount]);

  const selectADashboard = useCallback((dashName: string) => {
    setSelectedDashboard(dashName);
  }, []);

  const updateDashboardsState = useCallback((dashName: string, type: 'add' | 'remove') => {
    switch (type) {
      case 'add':
        setDashboardsArray(prev => [...prev, dashName]);
        break;
      case 'remove':
        setDashboardsArray((prev) => {
          return prev.filter(d => d !== dashName);
        });
    }
  }, []);

  const deleteADashboard = useCallback(async (dashName: string) => {
    const shouldDelete = window.prompt("Type DELETE to delete this Dashboard Permanently.");
    if (String(shouldDelete) === "DELETE") {
      await localforage.removeItem(dashName);
      updateDashboardsState(dashName, 'remove');
      selectADashboard('');
    }
  }, []);

  const createADashboard = useCallback(async () => {
    const keys = await localforage.keys();
    const dashName = newDashInput?.current!.value;
    if (dashName) {
      if (keys.includes(dashName)) {
        newDashInput!.current!.setCustomValidity("The Dashboard Name Must Be Unique.");
        newDashInput!.current!.reportValidity();
      } else {
        await localforage.setItem(dashName, {});
        updateDashboardsState(dashName, 'add');
        selectADashboard(dashName);
      }
    } else {
      newDashInput!.current!.setCustomValidity("The Dashboard Name Cannot Be Blank.");
      newDashInput!.current!.reportValidity();
    }
  }, []);

  return (
    <main>
      {selectedDashboard ? (
        <Dashboard deleteADashboard={deleteADashboard} selectADashboard={selectADashboard} selectedDashboard={selectedDashboard} />
      ) : (
        <>
          <h1>Dashboards</h1>
          <button 
            title="Refresh"
            onClick={() => setRefreshCount((prev) => prev + 1)}
          >
            <img style={{width: "20px"}} src={refresh} alt="Refresh" />
          </button>
          <div className={styles.dashBoardCreator}>
            <input ref={newDashInput} type="text" name="dashboardName" required />
            <button onClick={createADashboard}><p>Create A Dashboard</p></button>
          </div>
          <div>
            <p>My Dashboards:</p>
            {dashBoardsArray.map((dash, index) => {
              return (
                <button
                  key={`${dash}-${index}`}
                  onClick={() => selectADashboard(dash)}
                >
                  <p>{dash}</p>
                </button>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
