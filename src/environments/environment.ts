export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: 'TU_CLIENT_ID',
      authority: 'https://login.microsoftonline.com/TU_TENANT_ID',
      redirectUri: 'http://localhost:4200',
      postLogoutRedirectUri: 'http://localhost:4200'
    }
  }
};
