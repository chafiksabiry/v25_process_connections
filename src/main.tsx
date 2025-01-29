import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { registerMicroApps, start } from 'qiankun';

console.log('Qiankun loaded');

// Register micro apps with their lifecycle methods
const microApps = [
  {
    name: 'app1', // Microfrontend 1
    entry: '//localhost:5172/index.js', // URL of the micro frontend
    container: '#container-app1', // Container where it will be mounted
    activeRule: '/app1', // Route that triggers the micro frontend
  },
  {
    name: 'app2', // Microfrontend 2
    entry: '//localhost:5173',
    container: '#container-app2',
    activeRule: '/app2',
  },
  {
    name: 'app3', // Microfrontend 3
    entry: '//localhost:5174',
    container: '#container-app3',
    activeRule: '/app3',
    
  },
  {
    name: "app4",
    entry: "//localhost:5175",
    container: "#container-app4",
    activeRule: "/app4",
  },
];

// Register the apps with Qiankun
registerMicroApps(microApps, {
  beforeLoad: (app) => {
    console.log(`Before loading ${app.name}`);
    return Promise.resolve();
  },
  beforeMount: (app) => {
    console.log(`Before mounting ${app.name}`);
    
    return Promise.resolve();
  },
  afterUnmount: (app) => {
    console.log(`After unmounting ${app.name}`);
    return Promise.resolve();
  },
});

// Start Qiankun
start();

// Use createRoot to render the App
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root container not found');
}
