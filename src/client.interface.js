export default class ClientInterface {

  /* File operations */
  async getFile(filePath) { throw new Error('Not yet implemented.'); }
  async getFiles(folderPath) { throw new Error('Not yet implemented.'); }
  async copyFile(filePath, destination) { throw new Error('Not yet implemented.'); }
  async moveFile(filePath, newFilePath) { throw new Error('Not yet implemented.'); }
  async deleteFile(filePath) { throw new Error('Not yet implemented.'); }

  /* Spreadsheet operations */
  async appendRowToSheet(workbookPath, sheetId, values) { throw new Error('Not yet implemented.'); }
  async insertRowIntoSheetAt(workbookPath, sheetId, index, values) { throw new Error('Not yet implemented.'); }
  async updateSheetRowAt(workbookPath, sheetId, index, values) { throw new Error('Not yet implemented.'); }
  async appendColumnToSheet(workbookPath, sheetId, values) { throw new Error('Not yet implemented.'); }
  async insertColumnIntoSheetAt(workbookPath, sheetId, index, values) { throw new Error('Not yet implemented.'); }
  async updateSheetColumnAt(workbookPath, sheetId, index, values) { throw new Error('Not yet implemented.'); }
  async getCellRangeInSheet(workbookPath, sheetId, range) { throw new Error('Not yet implemented.'); }
  async findRowInSheet(workbookPath, sheetId, filter) { throw new Error('Not yet implemented.'); }
  async findRowsInSheet(workbookPath, sheetId, filter) { throw new Error('Not yet implemented.'); }
  async deleteRowFromSheet(workbookPath, sheetId, index) { throw new Error('Not yet implemented.'); }

  /* Document operations */
  async getPageMetadata(docPath) { throw new Error('Not yet implemented.'); }
  async getSectionMetadata(docPath, sectionindex) { throw new Error('Not yet implemented.'); }
  async getSections(docPath) { throw new Error('Not yet implemented.'); }
  async getSection(docPath, sectionIndex) { throw new Error('Not yet implemented.'); }
  async getBlocks(docPath, blockName) { throw new Error('Not yet implemented.'); }
  async getBlock(docPath, blockName) { throw new Error('Not yet implemented.'); }
  async insertBlockAt(docPath, sectionIndex, index, blockData) { throw new Error('Not yet implemented.'); }
  async removeBlock(docPath, blockIndex) { throw new Error('Not yet implemented.'); }
  async updatePageMetadata(docPath, metadata) { throw new Error('Not yet implemented.'); }
  async updateSection(docPath, sectionIndex, sectionMd) { throw new Error('Not yet implemented.'); }
  async appendSection(docPath, sectionMd) { throw new Error('Not yet implemented.'); }
  async insertSectionAt(docPath, index, sectionMd) { throw new Error('Not yet implemented.'); }
  async updateSectionMetadata(docPath, sectionIndex, metadata) { throw new Error('Not yet implemented.'); }
  async removeSection(docPath, sectionindex) { throw new Error('Not yet implemented.'); }
  async updateBlock(docPath, blockIndex, blockMd) { throw new Error('Not yet implemented.'); }
  async appendBlock(docPath, sectionIndex, blockMd) { throw new Error('Not yet implemented.'); }
}
