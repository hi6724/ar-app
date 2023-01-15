import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import Ar from './pages/Ar';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Ar />,
  },
  {
    path: 'ar',
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} />
);
