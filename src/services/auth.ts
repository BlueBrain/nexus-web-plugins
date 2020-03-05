import { Realm } from '@bbp/nexus-sdk';
import { Operation, Link, Observable } from '@bbp/nexus-link';
import { UserManager, User, WebStorageStateStore } from 'oidc-client';

import config from '../config';

function getConfig(realm?: Realm) {
  return {
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    authority: realm ? realm._issuer : '',
    client_id: config.clientId,
    redirect_uri: config.redirectUrl,
    popup_redirect_uri: config.redirectUrl,
    post_logout_redirect_uri: config.redirectUrl,
    response_type: 'id_token token',
    loadUserInfo: true,
  };
}

function saveAccessToken(token: string) {
  localStorage.setItem(config.bearerTokenKey, token);
}

function deleteAccessToken() {
  localStorage.removeItem(config.bearerTokenKey);
}

export const setToken: Link = (operation: Operation, forward?: Link) => {
  const token = localStorage.getItem(config.bearerTokenKey);
  if (!token) console.log('No access token in localstorage');
  const nextHeaders: any = { ...operation.headers };
  token && (nextHeaders['Authorization'] = `Bearer ${token}`);

  const nextOperation = {
    ...operation,
    headers: nextHeaders,
  };

  return forward ? forward(nextOperation) : new Observable();
};

export async function setUpSession(): Promise<[UserManager, User | null]> {
  const savedRealmStr = localStorage.getItem(config.preferredRealmKey);
  const preferredRealm: Realm = savedRealmStr
    ? JSON.parse(savedRealmStr)
    : config.defaultRealm;

  const userManager: UserManager | null = new UserManager(
    getConfig(preferredRealm)
  );

  const user = window.location.hash
    ? await userManager.signinRedirectCallback()
    : await userManager.getUser();

  window.history.pushState(
    '',
    document.title,
    window.location.pathname + window.location.search
  );

  if (user) {
    if (user.expired) {
      userManager.signinRedirect();
    }

    saveAccessToken(user.access_token);
  } else {
    deleteAccessToken();
    userManager.signinRedirect();
  }

  userManager.events.addUserLoaded((user: User) => {
    saveAccessToken(user.access_token);
  });

  userManager.events.addAccessTokenExpired(() => {
    localStorage.removeItem(config.bearerTokenKey);
  });

  return [userManager, user];
}
