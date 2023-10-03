const config = {
  defaultRealm: { _issuer: 'https://bbpauth.epfl.ch/auth/realms/BBP' },
  preferredRealmKey: 'preferredRealm',
  bearerTokenKey: 'nexusToken',
  serviceAccountName: 'serviceaccounts',
  clientId: 'bbp-nise-dev-nexus-fusion',
  redirectUrl: 'http://localhost:3000',
  environment: 'https://staging.nexus.bbp.epfl.ch/v1',
};


export default config;