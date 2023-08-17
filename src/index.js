import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css';
import reportWebVitals from './reportWebVitals';
import Gateway from './Pages/Gateway';
import Test from './Pages/Test';
import SplitExternal from './Pages/SplitExternal';

const router = createBrowserRouter([
  {
    path: "/payment",
    element: <Gateway />,
  },
  {
    path: '/',
    element: <Test />
  },
  {
    path: '/split_external',
    element: <SplitExternal />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
