# Helix Content SDK

This library offers a minimal SDK around content bus modifications for Helix.
It currently supports 2 backends:
- Microsoft Sharepoint, via an application service principal
- Google Drive, via a service account

:warning: Still early stage, so use at your own risk knowing we have:
- No input validation
- No error handling
- No tests

## Install

Just run:
```shell
npm install helix-content-sdk
```

## Giving access to the client

### Google Drive

1. Go to your Google Cloud console
2. Select the project to create the API access in
3. Enable the `Google Drive API`, `Google Docs API` & `Google Sheets API`
4. Create a new service account
5. Create a new key for the service account
6. Share the Google Drive folder for the project with the service account email

### Microsoft Sharepoint

1. Create a new App Registration in your azure portal
2. Create a client credential (certificate or secret) for it
3. Set the API permissions to `Files.SelectedOperations.Selected` and `Sites.Selected`
4. Give the app access to the desired Sharepoint site collection: https://devblogs.microsoft.com/microsoft365dev/controlling-app-access-on-specific-sharepoint-site-collections/

## Usage

### Google Drive

```js
import { getClient, CONTENT_TYPES } from './src/index.js';

const client = await getClient({
  type: CONTENT_TYPES.GOOGLE_DRIVE,
  // https://github.com/googleapis/google-api-nodejs-client?tab=readme-ov-file#service-account-credentials
  // default scopes are automatically injected
  authConfig: {
    keyFile: /* path to your key file */,
  },
  documentStoreConfig: {
    driveId: /* The id for the root folder of the project (take it from the project's fstab.yaml if needed) */
  }
});

const results = await client.getPageMetadata('/index');
console.log(results);
```

### Microsoft Sharepoint Drive

```js
import { getClient, CONTENT_TYPES } from './src/index.js';

const client = await getClient({
  type: CONTENT_TYPES.MICROSOFT_SHAREPOINT,
  authConfig: {
    // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/initialize-confidential-client-application.md#configuration-basics
    auth: {
      authority: 'https://login.microsoftonline.com/<directory id>', /* Replace 'directory id' with the value in your app registration */
      clientId: /* Your Azure app registration id */,
      clientSecret: /* Your Azure app registration client secret */,
    },
  },
  documentStoreConfig: {
    domain: /* Your sharepoint domain, i.e. 'adobe.sharepoint.com' */ ,
    domainId: /* The id for your domain, you can get it from the graph explorer */,
    siteId: /* The id for the sharepoint site collection that contains your project files */,
    rootPath: /* The path from the collection root to the actual website root, i.e. '/sites/my-site' */,
  }
});

const results = await client.getPageMetadata('/index.docx');
console.log(results);
```

## Client API

See: [client.interface.js](/src/client.interface.js)
