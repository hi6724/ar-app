import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import HitTest from './pages/HitTest';
import ThreeGlobe from './pages/ThreeGlobe';

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
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} />
);
