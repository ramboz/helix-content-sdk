export const CONTENT_TYPES = {
  MICROSOFT_SHAREPOINT: 'sharepoint',
  GOOGLE_DRIVE: 'gdrive',
}

export async function getClient(options = {}) {
  let providerPath;
  const { authConfig, documentStoreConfig } = options;
  switch (options.type) {
    case CONTENT_TYPES.MICROSOFT_SHAREPOINT:
      providerPath = './sharepoint';
      break;
    case CONTENT_TYPES.GOOGLE_DRIVE:
      providerPath = './gdrive';
      break;
    default:
      throw new Error(`Unknown content type ${options.type}. Please use one of the exported CONTENT_TYPES values.`)
  }
  const AuthProvider = await import(`${providerPath}/auth-provider.js`);
  const authProvider = AuthProvider.init(authConfig);
  const auth = await authProvider.auth();

  const sdkClient = await import(`${providerPath}/client.js`);
  return sdkClient.init({
    documentStoreConfig,
    auth,
  });
}