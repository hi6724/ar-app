import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function App() {
  const [log, setLog] = useState<any>([]);
  const [coord, setCoord] = useState<any>([]);

  const watchGeoLocation = () => {
    navigator.geolocation.watchPosition(
      ({ coords: { latitude, longitude } }) => {
        const newRecord = { latitude, longitude };
        setCoord(newRecord);
        setLog((prev: any) => [...prev, newRecord]);
      }
    );
  };
  const getCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setLog([...log, { latitude, longitude }]);
      }
    );
  };

  console.log(coord);

  return (
    <div>
      <button onClick={watchGeoLocation}>자동위치추적</button>
      <button onClick={getCurrentPosition}>현재위치기록</button>
      <h1>App</h1>
      <Link to={'/hit-test'}>to HitTest</Link>
      <Link to={'/three'}>to googleMap</Link>
      {log.map((el: any, i: number) => (
        <div key={i}>
          latitude:{el.latitude} longitude:{el.longitude}
        </div>
      ))}
    </div>
  );
}

export default App;
