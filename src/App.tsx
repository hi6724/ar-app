import React from 'react';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div>
      App
      <Link to={'/hit-test'}>to HitTest</Link>
    </div>
  );
}

export default App;
