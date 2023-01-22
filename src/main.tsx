import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Wrapper } from '@googlemaps/react-wrapper';

import App from './App';
import HitTest from './pages/HitTest';
import ThreeGlobe from './pages/ThreeGlobe';
import ThreeMap from './pages/ThreeMap';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: 'hit-test',
    element: <HitTest />,
  },
  {
    path: 'three',
    element: <ThreeGlobe />,
  },
  {
    path: 'map',
    element: <ThreeMap />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Wrapper apiKey='AIzaSyAhj152xH7BYpQQic-syvvx_j0tvjny2sM'>
    <RouterProvider router={router} />
  </Wrapper>
);
