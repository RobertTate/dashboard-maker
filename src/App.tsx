import { useEffect, useState } from 'react';
import OBR from '@owlbear-rodeo/sdk';

import PopOver from './components/PopOver';

export default function App() {
  const [obrIsReady, setObrIsReady] = useState(false);

  useEffect(() => {
    OBR.onReady(() => {
      setObrIsReady(true);
    });
  }, []);

  if (obrIsReady) {
    return (
      <PopOver />
    )
  } else {
    return (
      <>
        <h1>Scene isn't ready...</h1>
      </>
    );
  }
}
