import drive from '@googleapis/drive';
import AuthProviderInterface from '../auth-provider.interface.js';

class GoogleAuthProvider extends AuthProviderInterface {
  #authConfig;

  constructor(config) {
    super();
    this.#authConfig = {
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/documents'
      ],
      ...config
    };
  }

  async auth() {
    return new drive.auth.GoogleAuth(this.#authConfig);
  }
}

export function init(options) {
  return new GoogleAuthProvider(options);
}

