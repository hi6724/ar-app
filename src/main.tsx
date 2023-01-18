import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import HitTest from './pages/HitTest';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: 'hit-test',
    element: <HitTest />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} />
);
