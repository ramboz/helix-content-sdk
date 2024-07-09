import drive from '@googleapis/drive';
import sheets from '@googleapis/sheets';
import docs from '@googleapis/docs';
import { select, selectAll } from 'unist-util-select';
import between from 'unist-util-find-all-between';
import { findAllAfter } from 'unist-util-find-all-after';
import ClientInterface from '../client.interface.js';
import { asyncFind } from '../utils.js';
import toGdast from '@adobe/helix-gdocs2md/src/gdoc2gdast.js';
import toMdast from '@adobe/helix-gdocs2md/src/gdoc2mdast/index.js';
import dashedBreaks from '@adobe/helix-gdocs2md/src/mdast-dashed-breaks.js';
import processInternalLinks from '@adobe/helix-gdocs2md/src/mdast-internal-links.js';

class GDriveClient extends ClientInterface {
  #client;
  #documentsClient;
  #sheetsClient;
  #driveId;
  #filesCache;

  constructor(options) {
    super();
    this.#client = drive.drive({
      version: 'v2',
      auth: options.auth,
    });
    this.#sheetsClient = sheets.sheets({
      version: 'v4',
      auth: options.auth,
    });
    this.#documentsClient = docs.docs({
      version: 'v1',
      auth: options.auth,
    });
    this.#driveId = options.documentStoreConfig.driveId;
    this.#filesCache = {};
  }

  /* Helper methods */
  async #getParents(file) {
    if (!file.parents || !file.parents.length) {
      return [];
    }
    if (file.id === this.#driveId) {
      return [];
    }
    const { data: parent } = await this.#client.files.get({ fileId: file.parents[0].id });
    return [...await this.#getParents(parent), parent];
  }

  async #getFilePath(file) {
    if (this.#filesCache[file.id]) {
      return this.#filesCache[file.id];
    }
    const parents = await this.#getParents(file);
    const path = [
      ...parents.map((p) => p.id === this.#driveId ? '' : p.title),
      file.title
    ].join('/');
    this.#filesCache[file.id] = path;
    this.#filesCache[path] = file.id;
    return path;
  }

  async #getFileIdFromPath(filePath) {
    if (this.#filesCache[filePath]) {
      return this.#filesCache[filePath];
    }
    if (filePath === '/') {
      return this.#driveId;
    }
    const pathTokens = filePath.split('/');
    const { data: { items: files } } = await this.#client.files.list({
      q: `trashed = false and title = '${pathTokens.pop()}'`,
    });
    const file = await asyncFind(files, async (file) => {
      const path = await this.#getFilePath(file);
      this.#filesCache[path] = file.id;
      return path === filePath;
    });
    return file?.id;
  }

  /* Documents methods */
  async #getRawDocument(docPath) {
    const file = await this.getFile(docPath);
    const { data } = await this.#documentsClient.documents.get({ documentId: file.id });
    return data;
  }

  async #getDocumentHast(docPath) {
    const data = await this.#getRawDocument(docPath);
    const gdast = toGdast(data);
    const mdast = toMdast(gdast);
    dashedBreaks(mdast);
    processInternalLinks(mdast);
    return mdast;
  }

  async #getBlockNameSelector(blockName) {
    return `table:has(text[value="${blockName}"],text[value="${blockName.toLowerCase()}"])`;
  }

  async #getElementPosition(doc, sectionIndex, index) {
    let sIdx = 0;
    let structuralElementIdx = 0;
    const sibling = doc.body.content.find((c) => {
      if (['---\n', '—\n'].includes(c.paragraph?.elements[0].textRun?.content)) {
        sIdx++;
        structuralElementIdx = 0;
      } else {
        structuralElementIdx += 1;
      }
      return sIdx === sectionIndex && structuralElementIdx === index;
    });
    return sibling ? sibling.endIndex : -1;
  }

  /* File methods */
  async getFile(filePath) {
    const fileId = await this.#getFileIdFromPath(filePath);
    const { data } = await this.#client.files.get({ fileId });
    return data;
  }

  async getFiles(folderPath = '/') {
    const parentId = folderPath !== '/' ? await this.#getFileIdFromPath(folderPath) : this.#driveId;
    const { data: { items: files } } = await this.#client.files.list({
      q: `trashed = false and '${parentId}' in parents`,
    });
    return files.filter((file) => file.parents.length && file.parents[0].id === parentId);
  }

  async copyFile(filePath, destination) {
    const file = await this.getFile(filePath);
    const { name: newName, path: destinationPath } = this._parseFilePath(destination);
    const destinationId = await this.#getFileIdFromPath(destinationPath);
    let { data } = await this.#client.files.copy({ fileId: file.id });
    if (file.parents[0].id === destinationId && !newName) {
      return data;
    }
    const response = await this.#client.files.update({
      fileId: data.id,
      addParents: destinationId,
      removeParents: data.parents[0].id,
      requestBody: {
        title: newName || file.title
      },
    });
    return response.data;
  }

  async moveFile(filePath, destination) {
    const file = await this.getFile(filePath);
    const { name: newName, path: destinationPath } = this._parseFilePath(destination);
    const destinationId = await this.#getFileIdFromPath(destinationPath);
    const { data } = await this.#client.files.update({
      fileId: file.id,
      addParents: destinationId,
      removeParents: file.parents[0].id,
      requestBody: {
        title: newName || file.title
      },
    });
    return data;
  }

  async deleteFile(filePath) {
    const file = await this.getFile(filePath);
    const { data } = await this.#client.files.delete({ fileId: file.id });
    return data;
  }

  /* Spreadsheet methods */
  async appendRowToSheet(workbookPath, sheetId, values) {
    const workbookId = await this.#getFileIdFromPath(workbookPath);
    const { data } = await this.#sheetsClient.spreadsheets.values.append({
      spreadsheetId: workbookId,
      range: `${sheetId}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      }
    });
    return data;
  }

  async insertSheetRowAt(workbookPath, sheetId, index, values) {
    const workbookId = await this.#getFileIdFromPath(workbookPath);
    let res = await this.#sheetsClient.spreadsheets.get({
      spreadsheetId: workbookId,
    });
    const sheetIndex = res.data.sheets.findIndex((sheet) => sheet.properties.title === sheetId);
    await this.#sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId: workbookId,
      requestBody: {
        requests: [{
          insertRange: {
            shiftDimension: 'ROWS',
            range: {
              sheetId: sheetIndex,
              startRowIndex: index - 1,
              endRowIndex: index,

            }
          }
        }]
      }
    });
    return this.updateSheetRowAt(workbookPath, sheetId, index, values);
  }

  async updateSheetRowAt(workbookPath, sheetId, index, values) {
    const rangeEnd = (values.length > 26 ? String.fromCharCode(64 + Math.floor(values.length / 26)) : '')
      + String.fromCharCode(64 + (values.length % 26));
    const workbookId = await this.#getFileIdFromPath(workbookPath);
    const { data } = await this.#sheetsClient.spreadsheets.values.update({
      spreadsheetId: workbookId,
      range: `${sheetId}!A${index}:${rangeEnd}${index}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      }
    });
    return data;
  }

  async appendColumnToSheet(workbookPath, sheetId, values) {
    const headers = await this.getCellRangeInSheet(workbookPath, sheetId, 'A1:ZZ1');
    return this.updateSheetColumnAt(workbookPath, sheetId, headers.values[0].length + 1, values);
  }

  async insertSheetColumnAt(workbookPath, sheetId, index, values) {
    const workbookId = await this.#getFileIdFromPath(workbookPath);
    let res = await this.#sheetsClient.spreadsheets.get({
      spreadsheetId: workbookId,
    });
    const sheetIndex = res.data.sheets.findIndex((sheet) => sheet.properties.title === sheetId);
    await this.#sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId: workbookId,
      requestBody: {
        requests: [{
          insertRange: {
            shiftDimension: 'COLUMNS',
            range: {
              sheetId: sheetIndex,
              startColumnIndex: index - 1,
              endColumnIndex: index,
            }
          }
        }]
      }
    });
    return this.updateSheetColumnAt(workbookPath, sheetId, index, values);
  }

  async updateSheetColumnAt(workbookPath, sheetId, index, values) {
    const columnName = (index > 26 ? String.fromCharCode(64 + Math.floor(index / 26)) : '')
      + String.fromCharCode(64 + (index % 26));
    const workbookId = await this.#getFileIdFromPath(workbookPath);
    const { data } = await this.#sheetsClient.spreadsheets.values.update({
      spreadsheetId: workbookId,
      range: `${sheetId}!${columnName}:${columnName}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: values.map((v) => [v]),
      }
    });
    return data;
  }

  
  async getCellRangeInSheet(workbookPath, sheetId, range) {
    const workbookId = await this.#getFileIdFromPath(workbookPath);
    const { data } = await this.#sheetsClient.spreadsheets.values.get({
      spreadsheetId: workbookId,
      range: `${sheetId}${range ? `!${range}`: ''}`,
    });
    return data;
  }

  async findRowInSheet(workbookPath, sheetId, filter) {
    const { values } = await this.getCellRangeInSheet(workbookPath, sheetId);
    const index = values.findIndex(filter);
    return {
      index,
      values: values[index],
    }
  }

  async findRowsInSheet(workbookPath, sheetId, filter) {
    const { values } = await this.getCellRangeInSheet(workbookPath, sheetId);
    return values.map((row, index) => ({ index, values: row })).filter((result) => filter(result.values));
  }

  async deleteRowFromSheet(workbookPath, sheetId, index) {
    const workbookId = await this.#getFileIdFromPath(workbookPath);
    const res = await this.#sheetsClient.spreadsheets.get({
      spreadsheetId: workbookId,
    });
    const sheetIndex = res.data.sheets.findIndex((sheet) => sheet.properties.title === sheetId);
    const { data } = await this.#sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId: workbookId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetIndex,
              dimension: 'ROWS',
              startIndex: index,
              endIndex: index + 1
            }
          }
        }]
      }
    });
    return data;
  }

  /* Documents methods */
  async getDocument(docPath) {
    const file = await this.getFile(docPath);
    const { data } = await this.#documentsClient.documents.get({ documentId: file.id });
    const gdast = toGdast(data);
    return data;
  }

  async getPageMetadata(docPath) {
    return this.getBlock(docPath, 'Metadata');
  }

  async getSection(docPath, sectionIndex) {
    const sections = await this.getSections(docPath);
    return sections ? sections[sectionIndex] : null;
  }

  async getSections(docPath) {
    const tree = await this.#getDocumentHast(docPath);
    const sectionBreaks = selectAll('thematicBreak', tree);
    const sections = [];
    for (let i = 1; i < sectionBreaks.length; i += 1) {
      sections.push(between(tree, tree.children.indexOf(sectionBreaks[i-1]), tree.children.indexOf(sectionBreaks[i])));
    }
    sections.push(findAllAfter(tree, sectionBreaks[sectionBreaks.length - 1]));
    return sections;
  }

  async getSectionMetadata(docPath, sectionindex = 0) {
    return (await this.getBlocks(docPath, 'Section Metadata'))[sectionindex];
  }

  async getBlock(docPath, blockName) {
    const tree = await this.#getDocumentHast(docPath);
    return select(await this.#getBlockNameSelector(blockName), tree);
  }

  async getBlocks(docPath, blockName) {
    const tree = await this.#getDocumentHast(docPath);
    return selectAll(await this.#getBlockNameSelector(blockName), tree);
  }

  async insertBlockAt(docPath, sectionIndex, index, blockData) {
    const data = await this.#getRawDocument(docPath);
    const position = await this.#getElementPosition(data, sectionIndex, index);
    const rows = blockData.length;
    const columns = blockData[0].length;
    let start;
    let end = position + 2;
    return this.#documentsClient.documents.batchUpdate({
      documentId: data.documentId,
      requestBody: {
        requests: [
          {
            insertTable: {
              rows,
              columns,
              location: {
                index: position
              },
            },
          },
          ...blockData.map((row, i) => row.map((cell, j) => {
            if (!j) { end += 1; }
            start = end + 1;
            end = start + cell.length + 1;
            return {
              insertText: {
                text: cell,
                location: {
                  index: start,
                }
              }
            }
          })).flat().filter((cell) => cell.insertText.text)
      ],
      }
    });
  }

  async removeBlock(docPath, blockIndex) {
    const data = await this.#getRawDocument(docPath);
    const block = data.body.content.filter((c) => c.table)[blockIndex];
    return this.#documentsClient.documents.batchUpdate({
      documentId: data.documentId,
      requestBody: {
        requests: [{
          deleteContentRange: {
            range: {
              startIndex: block.startIndex,
              endIndex: block.endIndex
            }
          }
        }],
      }
    });
  }
}

export async function init(options) {
  return new GDriveClient(options)
}

