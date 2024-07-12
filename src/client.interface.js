export default class ClientInterface {

  /****************************************************************************
   * File operations
   ***************************************************************************/

  /**
   * Gets the metadata for the specified file.
   * @param {String} filePath The absolute path from the root (i.e. `/index.docx`)
   * @return {Object} Returns the metadata from the content repository
   */
  async getFile(filePath) { throw new Error('Not yet implemented.'); }
  
  /**
   * Lists the files in the specified folder.
   * @param {String} [folderPath] The absolute path from the root (i.e. `/articles/`). Defaults to the root.
   * @return {Object[]} Returns the metadata for the files in the specified folder
   */
  async listFiles(folderPath) { throw new Error('Not yet implemented.'); }

  /**
   * Copies the specified file to the desired destination.
   * @param {String} filePath The absolute path from the root (i.e. `/index.docx`)
   * @param {String} destination The destination path. Either a folder to copy the file keeping its
   *                             name to the destination, or a full file name if you want to rename
   * @return {Object} The raw API response
   */
  async copyFile(filePath, destination) { throw new Error('Not yet implemented.'); }

  /**
   * Moves the specified file to the desired destination.
   * @param {String} filePath The absolute path from the root (i.e. `/index.docx`)
   * @param {String} destination The destination path. Either a folder to move the file keeping its
   *                             name to the destination, or a full file name if you want to rename
   * @return {Object} The raw API response
   */
  async moveFile(filePath, destination) { throw new Error('Not yet implemented.'); }

  /**
   * Deletes the specified file.
   * @param {String} filePath The absolute path from the root (i.e. `/index.docx`)
   * @return {Object} The raw API response
   */
  async deleteFile(filePath) { throw new Error('Not yet implemented.'); }


  /****************************************************************************
   * Spreadsheet operations
   ***************************************************************************/

  /**
   * Appends the given row at the end of the specified sheet
   * @param {String} workbookPath The absolute path from the root (i.e. `/metadata.xlsx`)
   * @param {String} sheetId The name of the sheet (i.e. `Sheet 1`)
   * @param {String[]} values The values to add
   * @return {Object} The raw API response
   */
  async appendRowToSheet(workbookPath, sheetId, values) { throw new Error('Not yet implemented.'); }

  /**
   * Inserts the given row at the specified position in the sheet and pushes following rows down
   * @param {String} workbookPath The absolute path from the root (i.e. `/metadata.xlsx`)
   * @param {String} sheetId The name of the sheet (i.e. `Sheet 1`)
   * @param {Number} index The row index (starting at 1)
   * @param {String[]} values The values to add
   * @return {Object} The raw API response
   */
  async insertRowIntoSheetAt(workbookPath, sheetId, index, values) { throw new Error('Not yet implemented.'); }

  /**
   * Updates the row at the specified position in the sheet
   * @param {String} workbookPath The absolute path from the root (i.e. `/metadata.xlsx`)
   * @param {String} sheetId The name of the sheet (i.e. `Sheet 1`)
   * @param {Number} index The row index (starting at 1)
   * @param {String[]} values The values to write
   * @return {Object} The raw API response
   */
  async updateSheetRowAt(workbookPath, sheetId, index, values) { throw new Error('Not yet implemented.'); }

  /**
   * Appends the given column at the end of the specified sheet
   * @param {String} workbookPath The absolute path from the root (i.e. `/metadata.xlsx`)
   * @param {String} sheetId The name of the sheet (i.e. `Sheet 1`)
   * @param {String[]} values The values to add
   * @return {Object} The raw API response
   */
  async appendColumnToSheet(workbookPath, sheetId, values) { throw new Error('Not yet implemented.'); }

  /**
   * Inserts the given column at the specified position in the sheet and pushes following columns right
   * @param {String} workbookPath The absolute path from the root (i.e. `/metadata.xlsx`)
   * @param {String} sheetId The name of the sheet (i.e. `Sheet 1`)
   * @param {Number} index The row index (starting at 1 for column A)
   * @param {String[]} values The values to add
   * @return {Object} The raw API response
   */
  async insertColumnIntoSheetAt(workbookPath, sheetId, index, values) { throw new Error('Not yet implemented.'); }

  /**
   * Updates the column at the specified position in the sheet
   * @param {String} workbookPath The absolute path from the root (i.e. `/metadata.xlsx`)
   * @param {String} sheetId The name of the sheet (i.e. `Sheet 1`)
   * @param {Number} index The row index (starting at 1 for column A)
   * @param {String[]} values The values to write
   * @return {Object} The raw API response
   */
  async updateSheetColumnAt(workbookPath, sheetId, index, values) { throw new Error('Not yet implemented.'); }

  /**
   * Returns the cell values for the specified range in the sheet
   * @param {String} workbookPath The absolute path from the root (i.e. `/metadata.xlsx`)
   * @param {String} sheetId The name of the sheet (i.e. `Sheet 1`)
   * @param {String} range The range to return in the typical spreadsheet reference notation (i.e. `A1:D42`)
   * @return {String[][]} A 2-dimentional array representing the rows and cell values for the specified range
   */
  async getCellRangeInSheet(workbookPath, sheetId, range) { throw new Error('Not yet implemented.'); }

  /**
   * Finds the first row that matches the specified filter in the sheet
   * @param {String} workbookPath The absolute path from the root (i.e. `/metadata.xlsx`)
   * @param {String} sheetId The name of the sheet (i.e. `Sheet 1`)
   * @param {Function} filter A filter function taking each row as an argument (as an array of strings)
   * @return {Object} Returns an object with the row index and the row values (as an array of strings)
   */
  async findRowInSheet(workbookPath, sheetId, filter) { throw new Error('Not yet implemented.'); }

  /**
   * Finds all the rows that match the specified filter in the sheet
   * @param {String} workbookPath The absolute path from the root (i.e. `/metadata.xlsx`)
   * @param {String} sheetId The name of the sheet (i.e. `Sheet 1`)
   * @param {Function} filter A filter function taking each row as an argument (as an array of strings)
   * @return {Object[]} Returns an array of objects with the individual row index and the row values
   */
  async findRowsInSheet(workbookPath, sheetId, filter) { throw new Error('Not yet implemented.'); }

  /**
   * Deletes teh row at the specified index in the sheet and shift values up
   * @param {String} workbookPath The absolute path from the root (i.e. `/metadata.xlsx`)
   * @param {String} sheetId The name of the sheet (i.e. `Sheet 1`)
   * @param {Number} index The row index (starting at 1)
   * @return {Object} The raw API response
   */
  async deleteRowFromSheet(workbookPath, sheetId, index) { throw new Error('Not yet implemented.'); }


  /****************************************************************************
   * Document operations
   ***************************************************************************/

  /**
   * Returns the content for the specified document
   * @param {String} docPath The absolute path from the root (i.e. `/index.docx`)
   * @return {Object} The Mdast for the document content
   */
  async getDocumentContent(docPath) { throw new Error('Not yet implemented.'); }

  /**
   * Returns the content for the sections for the specified document
   * @param {String} docPath The absolute path from the root (i.e. `/index.docx`)
   * @return {Object[]} An array of Mdast for each section in the document
   */
  async getSections(docPath) { throw new Error('Not yet implemented.'); }

  /**
   * Returns the content for the section at the specified index in the document
   * @param {String} docPath The absolute path from the root (i.e. `/index.docx`)
   * @param {Number} sectionIndex The index of the section (starting at 0)
   * @return {Object} The Mdast for the section in the document
   */
  async getSection(docPath, sectionIndex) { throw new Error('Not yet implemented.'); }

  /**
   * Returns the content for the blocks with the specified name in the document
   * @param {String} docPath The absolute path from the root (i.e. `/index.docx`)
   * @param {String} blockName The block name to look for
   * @return {Object[]} An array of Mdast for the blocks in the document
   */
  async getBlocks(docPath, blockName) { throw new Error('Not yet implemented.'); }

  /**
   * Returns the content for first block with the specified name in the document
   * @param {String} docPath The absolute path from the root (i.e. `/index.docx`)
   * @param {String} blockName The block name to look for
   * @return {Object} The Mdast for the block in the document
   */
  async getBlock(docPath, blockName) { throw new Error('Not yet implemented.'); }

  /**
   * Appends the specified block in the document
   * @param {String} docPath The absolute path from the root (i.e. `/index.docx`)
   * @param {Number} sectionIndex The index of the section (starting at 0)
   * @param {String[][]} blockData A 2-dimentional array representing the rows and cell values for the block
   * @return {Object} The raw API response
   */
  async appendBlock(docPath, sectionIndex, blockData) { throw new Error('Not yet implemented.'); }

  /**
   * Inserts the specified block in the document
   * @param {String} docPath The absolute path from the root (i.e. `/index.docx`)
   * @param {Number} sectionIndex The index of the section (starting at 0)
   * @param {Number} index The index of the block inside the section children
   * @param {String[][]} blockData A 2-dimentional array representing the rows and cell values for the block
   * @return {Object} The raw API response
   */
  async insertBlockAt(docPath, sectionIndex, index, blockData) { throw new Error('Not yet implemented.'); }

  /**
   * Updates the block content in the document
   * @param {String} docPath The absolute path from the root (i.e. `/index.docx`)
   * @param {Number} blockIndex The block index inside the document (starting at 0)
   * @param {String[][]} blockData A 2-dimentional array representing the rows and cell values for the block
   *                               (without the header)
   * @return {Object} The raw API response
   */
  async updateBlock(docPath, blockIndex, blockData) { throw new Error('Not yet implemented.'); }

  /**
   * Removes the specified block from the document
   * @param {String} docPath The absolute path from the root (i.e. `/index.docx`)
   * @param {Number} blockIndex The block index inside the document (starting at 0)
   * @return {Object} The raw API response
   */
  async removeBlock(docPath, blockIndex) { throw new Error('Not yet implemented.'); }
  
  /**
   * Returns the page metadata for the specified file
   * @param {String} docPath The absolute path from the root (i.e. `/index.docx`)
   * @return {Object} An object with key/values for the metadata in the page
   */
  async getPageMetadata(docPath) { throw new Error('Not yet implemented.'); }

  /**
   * Updates the page metadata with the specified values
   * @param {String} docPath The absolute path from the root (i.e. `/index.docx`)
   * @param {Object} metadata An object with key/value pairs to be written
   * @return {Object} The raw API response
   */
  async updatePageMetadata(docPath, metadata) { throw new Error('Not yet implemented.'); }

  /**
   * Returns the section metadata for the specified section in the file
   * @param {String} docPath The absolute path from the root (i.e. `/index.docx`)
   * @param {Number} sectionIndex The index of the section (starting at 0)
   * @return {Object} An object with key/values for the metadata in the section
   */
  async getSectionMetadata(docPath, sectionIndex) { throw new Error('Not yet implemented.'); }

  /**
   * Updates the section metadata with the specified values
   * @param {String} docPath The absolute path from the root (i.e. `/index.docx`)
   * @param {Number} sectionIndex The index of the section (starting at 0)
   * @param {Object} metadata An object with key/value pairs to be written
   * @return {Object} The raw API response
   */
  async updateSectionMetadata(docPath, sectionIndex, metadata) { throw new Error('Not yet implemented.'); }
}
