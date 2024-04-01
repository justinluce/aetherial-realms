import './App.css';
import MainUI from './interface/MainUI/MainUI';
import * as THREE from 'three';
import { useEffect, useState } from 'react';
import React from 'react';

function App() {
  const [canRun, setCanRun] = useState(false);
  const [warning, setWarning] = useState(null);

  return (
    <div>
      <MainUI />
    </div>
  );
}

export default App;
