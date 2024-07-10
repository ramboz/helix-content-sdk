import graph from '@microsoft/microsoft-graph-client';
import ClientInterface from '../client.interface.js';
import { colIndexToLetter, parseFilePath } from '../utils.js';

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
    const { name: newName, path: destinationPath } = parseFilePath(destination);
    const parent = await this.#client.api(this.#getFullPath(destinationPath)).get();
    return this.#client.api(`${this.#getFullPath(filePath)}:/copy`)
      .post({
        name: newName,
        parentReference: { id: parent.id },
      });
  }

  async moveFile(filePath, destination) {
    const { name: newName, path: destinationPath } = parseFilePath(destination);
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

  /* Spreadsheet methods */
  async appendRowToSheet(workbookPath, sheetId, values) {
    const response = await this.#client.api(`${this.#getFullPath(workbookPath)}:/workbook/worksheets/${sheetId}/range(address='A:ZZ')/usedRange`)
      .get();
    const rows = response.rowCount;
    return this.insertRowIntoSheetAt(workbookPath, sheetId, rows + 1, values);
  }

  async insertRowIntoSheetAt(workbookPath, sheetId, index, values) {
    const rangeEnd = colIndexToLetter(values.length);
    const range = `A${index}:${rangeEnd}${index}`;
    await this.#client.api(`${this.#getFullPath(workbookPath)}:/workbook/worksheets/${sheetId}/range(address='${range}')/insert`)
      .post({ shift: 'Down' });
    return this.updateSheetRowAt(workbookPath, sheetId, index, values);
  }

  async updateSheetRowAt(workbookPath, sheetId, index, values) {
    const rangeEnd = colIndexToLetter(values.length);
    const range = `A${index}:${rangeEnd}${index}`;
    return this.#client.api(`${this.#getFullPath(workbookPath)}:/workbook/worksheets/${sheetId}/range(address='${range}')`)
      .update({ values: [values] });
  }
  
  async deleteRowFromSheet(workbookPath, sheetId, index) {
    const response = await this.#client.api(`${this.#getFullPath(workbookPath)}:/workbook/worksheets/${sheetId}/range(address='A:ZZ')/usedRange`)
      .get();
    const cols = response.columnCount;
    const rangeEnd = colIndexToLetter(cols);
    const range = `A${index}:${rangeEnd}${index}`;
    return this.#client.api(`${this.#getFullPath(workbookPath)}:/workbook/worksheets/${sheetId}/range(address='${range}')/delete`)
      .post({ shift: 'Up' });
  }

  async getCellRangeInSheet(workbookPath, sheetId, range) {
    const data = await this.#client.api(`${this.#getFullPath(workbookPath)}:/workbook/worksheets/${sheetId}/range(address='${range}')`)
      .get();
    return data.values;
  }

  async findRowInSheet(workbookPath, sheetId, filter) {
    const response = await this.#client.api(`${this.#getFullPath(workbookPath)}:/workbook/worksheets/${sheetId}/range(address='A:ZZ')/usedRange`)
      .get();
    return response.values.find(filter);
  }

  async findRowsInSheet(workbookPath, sheetId, filter) {
    const response = await this.#client.api(`${this.#getFullPath(workbookPath)}:/workbook/worksheets/${sheetId}/range(address='A:ZZ')/usedRange`)
      .get();
    return response.values.filter(filter);
  }

  async appendColumnToSheet(workbookPath, sheetId, values) {
    const response = await this.#client.api(`${this.#getFullPath(workbookPath)}:/workbook/worksheets/${sheetId}/range(address='A:ZZ')/usedRange`)
      .get();
    const cols = response.columnCount;
    console.log(1, cols, values);
    return this.insertColumnIntoSheetAt(workbookPath, sheetId, cols + 1, values);
  }

  async insertColumnIntoSheetAt(workbookPath, sheetId, index, values) {
    const column = colIndexToLetter(index);
    const range = `${column}1:${column}${values.length}`;
    console.log(2, range);
    await this.#client.api(`${this.#getFullPath(workbookPath)}:/workbook/worksheets/${sheetId}/range(address='${range}')/insert`)
      .post({ shift: 'Right' });
    return this.updateSheetColumnAt(workbookPath, sheetId, index, values);
  }

  async updateSheetColumnAt(workbookPath, sheetId, index, values) {
    const column = colIndexToLetter(index);
    const range = `${column}1:${column}${values.length}`;
    return this.#client.api(`${this.#getFullPath(workbookPath)}:/workbook/worksheets/${sheetId}/range(address='${range}')`)
      .update({ values: values.map((v) => [v]) });
  }

  /* Documents methods */
  // async getPageMetadata(docPath) {}
  // async getSectionMetadata(docPath, sectionindex) {}
  // async getSections(docPath) {}
  // async getSection(docPath, sectionIndex) {}
  // async getBlocks(docPath, blockName) {}
  // async getBlock(docPath, blockName) {}
  // async insertBlockAt(docPath, sectionIndex, index, blockData) {}
  // async removeBlock(docPath, blockIndex) {}
  // async updatePageMetadata(docPath, metadata) {}
  // async updateSection(docPath, sectionIndex, sectionMd) {}
  // async appendSection(docPath, sectionMd) {}
  // async insertSectionAt(docPath, index, sectionMd) {}
  // async updateSectionMetadata(docPath, sectionIndex, metadata) {}
  // async removeSection(docPath, sectionindex) {}
  // async updateBlock(docPath, blockIndex, blockMd) {}
  // async appendBlock(docPath, sectionIndex, blockMd) {}
}

export async function init(options) {
  return new SharepointClient(options)
}

