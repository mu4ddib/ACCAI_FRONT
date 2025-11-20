export const environment = {
  production: true,
  apiBase: "",
  msalConfig: {
    auth: {
      clientId: '#{AZURE_CLIENT_ID}#',
      authority: 'https://login.microsoftonline.com/#{AZURE_TENANT_ID}#',
      redirectUri: '#{APP_URL}#',
      postLogoutRedirectUri: '#{APP_URL}#'
    }
  }
};
