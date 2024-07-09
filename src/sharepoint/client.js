import graph from '@microsoft/microsoft-graph-client';
import ClientInterface from '../client.interface.js';

class SharepointClient extends ClientInterface {
  #client;
  #baseUri;

  constructor(options) {
    super();
    const { domain, domainId, siteId, rootPath = ''} = options.documentStoreConfig;
    this.#client = graph.Client.init({
      authProvider: (done) => done(null, options.auth),
    });
    this.#baseUri = `/sites/${domain},${domainId},${siteId}/drive/root:${rootPath}`;
  }

  /* Helper methods */
  #getFullPath(filePath) {
    return `${this.#baseUri}${filePath}`;
  }

  /* File methods */
  async getFile(filePath) {
    return this.#client.api(this.#getFullPath(filePath)).get();
  }

  async getFiles() {
    return this.#client.api(`${this.#baseUri}:/children`).get();
  }

  async copyFile(filePath, destination) {
    const { name: newName, path: destinationPath } = this._parseFilePath(destination);
    const parent = await this.#client.api(this.#getFullPath(destinationPath)).get();
    return this.#client.api(`${this.#getFullPath(filePath)}:/copy`)
      .post({
        name: newName,
        parentReference: { id: parent.id },
      });
  }

  async moveFile(filePath, destination) {
    const { name: newName, path: destinationPath } = this._parseFilePath(destination);
    const parent = await this.#client.api(this.#getFullPath(destinationPath)).get();
    return this.#client.api(this.#getFullPath(filePath))
	    .update({
        name: newName,
        parentReference: { id: parent.id },
      });
  }

  async deleteFile(filePath) {
    return this.#client.api(this.#getFullPath(filePath)).delete();
  }
}

export async function init(options) {
  return new SharepointClient(options)
}

