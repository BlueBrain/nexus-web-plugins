import React from 'react';
import ReactDOM from 'react-dom/client';
import { createNexusClient } from '@bbp/nexus-sdk';

import config from './config';
import App from './app/App';
import { setUpSession, setToken } from './services/auth';
import './index.css';

async function init() {
  const [, user] = await setUpSession();
  const nexus = createNexusClient({
    fetch,
    uri: config.environment,
    links: [setToken],
  });

  if (!user) {
    throw new Error('No user');
  }

  ReactDOM.createRoot(
    document.getElementById('app')!
  ).render(
    <React.StrictMode>
      <App user={user} nexus={nexus} />
    </React.StrictMode>
  );
}

init();
