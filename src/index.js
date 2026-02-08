import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// [1] import 추가
import { HelmetProvider } from 'react-helmet-async';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* [2] App을 HelmetProvider로 감싸줍니다 */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
