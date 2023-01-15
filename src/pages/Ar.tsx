import React, { useState } from 'react';
import 'mind-ar/dist/mindar-image.prod.js';
import 'aframe';
import 'mind-ar/dist/mindar-image-aframe.prod.js';
import MindARViewer from './mindar-viewer';

function Ar() {
  const [started, setStarted] = useState(false);
  return (
    <div className='App'>
      <h1>
        Example React component with{' '}
        <a href='https://github.com/hiukim/mind-ar-js' target='_blank'>
          MindAR
        </a>
      </h1>

      <div>
        {!started && (
          <button
            onClick={() => {
              setStarted(true);
            }}
          >
            Start
          </button>
        )}
        {started && (
          <button
            onClick={() => {
              setStarted(false);
            }}
          >
            Stop
          </button>
        )}
      </div>

      {started && (
        <div className='container'>
          <MindARViewer />
          <video></video>
        </div>
      )}
    </div>
  );
}

export default Ar;
