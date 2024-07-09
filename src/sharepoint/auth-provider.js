import * as msal from '@azure/msal-node';
import AuthProviderInterface from '../auth-provider.interface.js';

class SharepointAuthProvider extends AuthProviderInterface {
  #accessToken;
  #account;
  #idToken;
  #msalConfig;

  constructor(config) {
    super();
    this.#msalConfig = config;
  }

  async auth() {
    const msalInstance = new msal.ConfidentialClientApplication(this.#msalConfig);
    const accessTokenRequest = {
      scopes: ['https://graph.microsoft.com/.default'],
    };
    const tokenResponse = await msalInstance.acquireTokenByClientCredential(accessTokenRequest);
    this.#accessToken = tokenResponse.accessToken;
    this.#idToken = tokenResponse.accessToken;
    this.#account = tokenResponse.account;
    return this.#accessToken;
  }
}

export function init(config) {
  return new SharepointAuthProvider(config)
}

