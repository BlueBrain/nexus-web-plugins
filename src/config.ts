
export default {
  defaultRealm: { _issuer: 'https://bbpteam.epfl.ch/auth/realms/BBP' },
  preferredRealmKey: 'preferredRealm',
  bearerTokenKey: 'nexusToken',
  serviceAccountName: 'serviceaccounts',
  clientId: 'bbp-workflow-web',
  redirectUrl: 'http://localhost:3000',
  environment: 'https://staging.nexus.ocp.bbp.epfl.ch/v1',
};
