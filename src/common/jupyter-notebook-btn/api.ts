import { JUPYTER_HUB_BASE_URL } from './config';
import { ApiUser, ApiServer } from './types';

export function getRunAllocationBaseUrl(userName: string, serverName?: string) {
  const userApiUrl = `${JUPYTER_HUB_BASE_URL}/hub/api/users/${userName}`;

  return serverName && serverName !== 'default'
    ? `${userApiUrl}/servers/${serverName}`
    : `${userApiUrl}/server`;
}

export function getNotebookUrl(userName: string, serverName?: string) {
  const userUrl = `${JUPYTER_HUB_BASE_URL}/user/${userName}`;

  return serverName && serverName !== 'default'
    ? `${userUrl}/${serverName}`
    : `${userUrl}`;
}

export function waitServerReady(
  apiToken: string,
  userName: string,
  serverName?: string
): Promise<ApiServer> {
  return new Promise((resolve, reject) => {
    const check = async () => {
      const url = `${JUPYTER_HUB_BASE_URL}/hub/api/users/${userName}`;

      const userStatusRes = await fetch(url, {
        headers: new Headers({
          Authorization: `token ${apiToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        })
      });

      const user: ApiUser = await userStatusRes.json();
      const server = user.servers[serverName || ''];

      if (!server) {
        return reject();
      }

      if (server.ready) {
        return resolve(server);
      }

      setTimeout(() => check(), 2000);
    };

    check();
  });
}
