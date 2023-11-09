import localforage from 'localforage';
import { useEffect, useState, useCallback, useRef } from 'react';
import Dashboard from './Dashboard';

export default function PopOver() {
  const [selectedDashboard, setSelectedDashboard] = useState('');
  const [dashBoardsArray, setDashboardsArray] = useState<string[]>([]);
  const newDashInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initDashboards = async () => {
      const keys = await localforage.keys();
      setDashboardsArray(keys);
    };

    initDashboards();
    console.log('useEffect Ran!');
  }, []);

  const selectADashboard = useCallback((dashName: string) => {
    setSelectedDashboard(dashName);
  }, []);

  const updateDashboardsState = useCallback((dashName: string, type: 'add' | 'remove') => {
    switch(type) {
      case 'add':
        setDashboardsArray(prev => [...prev, dashName]);
        break;
      case 'remove':
        setDashboardsArray((prev) => {
          return prev.filter(d => d !== dashName);
        });
    }
  }, []);

  const deleteADashboard = useCallback( async (dashName: string) => {
    await localforage.removeItem(dashName);
    updateDashboardsState(dashName, 'remove');
    selectADashboard('');
  }, []);

  const createADashboard = useCallback(async () => {
    const dashName = newDashInput?.current!.value;
    await localforage.setItem(dashName, {});
    updateDashboardsState(dashName, 'add');
    selectADashboard(dashName);
  }, []);

  return (
    <>
      {selectedDashboard ? (
        <Dashboard deleteADashboard={deleteADashboard} selectADashboard={selectADashboard} selectedDashboard={selectedDashboard} />
      ) : (
        <>
          <h1>OB Dashes</h1>
          <input ref={newDashInput} type="text" name="dashboardName" />
          <button onClick={createADashboard}>Create A Dashboard</button>
          <div>
            <p>My Dashboards:</p>
            {dashBoardsArray.map((dash, index) => {
              return (
                <button 
                  key={`${dash}-${index}`}
                  onClick={() => selectADashboard(dash)}
                >
                  {dash}
                </button>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
