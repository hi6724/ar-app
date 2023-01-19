import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function App() {
  const [log, setLog] = useState<any>([]);
  const handleClick = (e: any) => {
    navigator.geolocation.watchPosition(
      ({ coords }) => {
        const now = new Date();
        setLog([
          ...log,
          {
            time: now.toLocaleTimeString(),
            lat: coords.latitude,
            lng: coords.longitude,
          },
        ]);
      },
      (err) => alert(err.message),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );
  };

  return (
    <div>
      <button onClick={handleClick}>위치추적</button>
      <h1>App</h1>
      <Link to={'/hit-test'}>to HitTest</Link>
      {log.map((el: any, i: number) => (
        <div key={i}>
          latitude:{el.lat} longitude:{el.lng}
        </div>
      ))}
    </div>
  );
}

export default App;
