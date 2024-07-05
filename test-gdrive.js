import { getClient, CONTENT_TYPES } from './src/index.js';

const client = await getClient({
  type: CONTENT_TYPES.GOOGLE_DRIVE,
  authConfig: {
    keyFile: '/Users/ramboz/Projects/misc/helix-content-sdk/adobe-franklin-1654249406987-fa453067f4da.json',
  },
  documentStoreConfig: {
    driveId: '1fdxHK6AxHD_0pXhC2lWrw4YU0AYFxqsC'
  }
});

const results = await client.getBlock('/about/index', 'Blade');
console.log(results);