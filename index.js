
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(React.createElement(App));