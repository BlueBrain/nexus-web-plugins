import React from 'react';
import ReactDOM from 'react-dom';
import { createNexusClient } from '@bbp/nexus-sdk';

import config from './config';
import App from './app/App';
import { setUpSession, setToken } from './services/auth';
import * as serviceWorker from './serviceWorker';

import 'antd/dist/antd.css';
import './index.css';

async function init() {
  const [userMaganer, user] = await setUpSession();
  const nexus = createNexusClient({
    fetch,
    uri: config.environment,
    links: [setToken],
  });

  if (!user) {
    throw new Error('No user');
  }

  ReactDOM.render(
    <App user={user} nexus={nexus} />,
    document.getElementById('app')
  );
}

init();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
