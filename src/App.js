import logo from './logo.svg';
import './App.css';
import MainUI from './interface/MainUI/MainUI';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { useEffect, useState } from 'react';

function App() {
  const [canRun, setCanRun] = useState(false);
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    const available = WebGL.isWebGLAvailable();
    if (available) {
      setCanRun(true)
    } else {
      setWarning(WebGL.getWebGLErrorMessage());
      setCanRun(false);
    }
  }, []);

  return (
    canRun === true ? 
    (
    <div>
      <MainUI />
    </div>
    ) 
    :
    (
    <div>
      <h1>{warning}</h1>
    </div>
    )
  );
}

export default App;
