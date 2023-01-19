import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function App() {
  const [log, setLog] = useState<any>([]);
  const [compass, setCompass] = useState<any>([]);
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
      ({ coords: { latitude, longitude, heading } }) => {
        setLog([...log, { latitude, longitude, heading }]);
      }
    );
  };

  const initCompass = () => {
    alert('start compass!!');
    window.addEventListener(
      'deviceorientationabsolute',
      (e: any) => {
        setCompass([...compass, e.alpha]);
      },
      true
    );
  };

  return (
    <div>
      <div>
        <button onClick={watchGeoLocation}>자동위치추적</button>
        <button onClick={getCurrentPosition}>현재위치기록</button>
      </div>
      <div>
        <button onClick={initCompass}>나침반</button>
      </div>
      <div>
        <Link to={'/hit-test'}>#HitTest</Link>
      </div>
      <div>
        <Link to={'/three'}>#googleMap</Link>
      </div>
      {log.map((el: any, i: number) => (
        <div key={i}>
          latitude:{el.latitude} longitude:{el.longitude} heading: {el.heading}
        </div>
      ))}
      {compass.map((el: any, i: any) => (
        <div key={i}>{el}</div>
      ))}
    </div>
  );
}

export default App;
