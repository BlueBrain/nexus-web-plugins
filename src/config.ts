export default {
  defaultRealm: { _issuer: 'https://bbpauth.epfl.ch/auth/realms/BBP' },
  preferredRealmKey: 'preferredRealm',
  bearerTokenKey: 'nexusToken',
  serviceAccountName: 'serviceaccounts',
  clientId: 'bbp-workflow-web',
  redirectUrl: 'http://localhost:3000',
  environment: 'https://bbp.epfl.ch/nexus/v1',
};
