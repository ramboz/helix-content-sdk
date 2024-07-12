import graph from '@microsoft/microsoft-graph-client';
import docx2dast from '@adobe/helix-docx2md/src/docx2dast/docx2dast.js';
import dast2mdast from '@adobe/helix-docx2md/src/dast2mdast/dast2mdast.js';
import { mdast2docx } from '@adobe/helix-md2docx';
import deepEqual from 'deep-equal';
import fetch from 'node-fetch';
import GenericClient from '../generic.client.js';
import { colIndexToLetter, parseFilePath } from '../utils.js';

class SharepointClient extends GenericClient {
  #client;
  #baseUri;

  constructor(options) {
    super();
    const { domain, domainId, rootPath = ''} = options.documentStoreConfig;
    this.#client = graph.Client.init({
      authProvider: (done) => done(null, options.auth),
    });
    this.#baseUri = `/sites/${domain},${domainId}/drive/root:${rootPath}`;
  }

  /* Helper methods */
  #getFullPath(filePath) {
    return `${this.#baseUri}${filePath}`;
  }

  async #getRawDocument(docPath) {
    let response = await this.#client.api(`${this.#getFullPath(docPath)}`).get();
    const url = response['@microsoft.graph.downloadUrl'];
    response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
  }

  async #uploadDocument(docPath, mdast) {
    const buffer = await mdast2docx(mdast);
    console.log(`${this.#getFullPath(docPath)}:/content`);
    return this.#client.api(`${this.#getFullPath(docPath)}:/content`).putStream(buffer);
  }

  async #updateDocument(docPath, updateFunction) {
    const doc = await this.getDocumentContent(docPath);
    const initial = structuredClone(doc);
    await updateFunction(doc);
    if (deepEqual(initial, doc, { strict: true })) {
      return;
    }
    return this.#uploadDocument(docPath, doc);
  }

  #matrixToMdastTable(matrix) {
    return {
      type: 'table',
      children: matrix.map((row) => ({
        type: 'tableRow',
        children: row.map((cell) => ({
          type: 'tableCell',
          children: [{
            type: 'paragraph',
            children: [{
              type: 'text',
              value: cell // TODO: support MD markup for complex cells?
            }],
          }],
        })),
      })),
    };
  }

  /* File methods */
  async getFile(filePath) {
    return this.#client.api(this.#getFullPath(filePath)).get();
  }

  async listFiles(folderPath = '/') {
    return this.#client.api(`${this.#getFullPath(folderPath)}:/children`).get();
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
    const index = response.values.findIndex(filter);
    return {
      index,
      values: response.values[index],
    }
  }

  async findRowsInSheet(workbookPath, sheetId, filter) {
    const response = await this.#client.api(`${this.#getFullPath(workbookPath)}:/workbook/worksheets/${sheetId}/range(address='A:ZZ')/usedRange`)
      .get();
    return response.values
      .map((row, index) => ({ index, values: row }))
      .filter((result) => filter(result.values));
  }

  async appendColumnToSheet(workbookPath, sheetId, values) {
    const response = await this.#client.api(`${this.#getFullPath(workbookPath)}:/workbook/worksheets/${sheetId}/range(address='A:ZZ')/usedRange`)
      .get();
    const cols = response.columnCount;
    return this.insertColumnIntoSheetAt(workbookPath, sheetId, cols + 1, values);
  }

  async insertColumnIntoSheetAt(workbookPath, sheetId, index, values) {
    const column = colIndexToLetter(index);
    const range = `${column}1:${column}${values.length}`;
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
  async getDocumentContent(docPath) {
    const data = await this.#getRawDocument(docPath);
    const dast = await docx2dast(data, {});
    const mdast = await dast2mdast(dast, {});
    return mdast;
  }

  async appendBlock(docPath, sectionIndex, blockData) {
    return this.#updateDocument(docPath, (mdast) => {
      let sectionIdx = 0;
      const elementIdx = mdast.children.findIndex((c) => {
        if (c.type === 'thematicBreak') {
          sectionIdx += 1;
        }
        return sectionIdx > sectionIndex;
      })
      const table = this.#matrixToMdastTable(blockData);
      if (elementIdx !== -1) {
        mdast.children.splice(elementIdx, 0, table);
      } else {
        mdast.children.push(table);
      }
    });
  }

  async insertBlockAt(docPath, sectionIndex, index, blockData) {
    return this.#updateDocument(docPath, (mdast) => {
      let sectionIdx = 0;
      let elementIdx = 0;
      mdast.children.find((c) => {
        if (c.type === 'thematicBreak') {
          sectionIdx += 1;
          elementIdx = 0;
        }
        elementIdx += 1;
        if (index === elementIdx) {
          return true;
        }
        return sectionIdx > sectionIndex;
      });
      const table = this.#matrixToMdastTable(blockData);
      mdast.children.splice(elementIdx, 0, table);
    });
  }

  async updateBlock(docPath, blockIndex, blockData) {
    return this.#updateDocument(docPath, (mdast) => {
      const blocks = mdast.children.filter((c) => c.type === 'table');
      const block = blocks[blockIndex];
      const index = mdast.children.findIndex((c) => c === block);
      const table = this.#matrixToMdastTable(blockData);
      mdast.children[index] = table;
    });
  }

  async removeBlock(docPath, blockIndex) {
    return this.#updateDocument(docPath, (mdast) => {
      const blocks = mdast.children.filter((c) => c.type === 'table');
      const block = blocks[blockIndex];
      const index = mdast.children.findIndex((c) => c === block);
      mdast.children.splice(index, 1);
    });
  }

  async updatePageMetadata(docPath, metadata) {
    return this.#updateDocument(docPath, (mdast) => {
      const blockIndex = mdast.children.findIndex((c) => c.type === 'table' && c.children[0].children[0].children[0].children[0].value.toLowerCase() === 'metadata');
      const block = mdast.children[blockIndex];
      const table = this.#matrixToMdastTable(Object.entries(metadata));
      block.children = [block.children[0], ...table.children];
    });
  }

  async updateSectionMetadata(docPath, sectionIndex, metadata) {
    return this.#updateDocument(docPath, (mdast) => {
      const blocks = mdast.children.filter((c) => c.type === 'table' && c.children[0].children[0].children[0].children[0].value.toLowerCase() === 'section metadata');
      const block = blocks[sectionIndex];
      const table = this.#matrixToMdastTable(Object.entries(metadata));
      block.children = [block.children[0], ...table.children];
    });
  }
}

export async function init(options) {
  return new SharepointClient(options)
}

