import { select, selectAll } from 'unist-util-select';
import ClientInterface from './client.interface.js';
import { getBlockNameSelector, getSectionsFromMdast, mdastTableToObject } from './utils.js';

export default class GenericClient extends ClientInterface {
  async getBlock(docPath, blockName) {
    const tree = await this.getDocument(docPath);
    return select(await getBlockNameSelector(blockName), tree);
  }

  async getBlocks(docPath, blockName) {
    const tree = await this.getDocument(docPath);
    return selectAll(await getBlockNameSelector(blockName), tree);
  }

  async getPageMetadata(docPath) {
    const table = await this.getBlock(docPath, 'Metadata');
    return mdastTableToObject(table);
  }

  async getSection(docPath, sectionIndex) {
    const sections = await this.getSections(docPath);
    return sections ? sections[sectionIndex] : null;
  }

  async getSections(docPath) {
    const tree = await this.getDocument(docPath);
    return getSectionsFromMdast(tree);
  }

  async getSectionMetadata(docPath, sectionindex = 0) {
    const blocks = await this.getBlocks(docPath, 'Section Metadata');
    const table = blocks[sectionindex];
    return mdastTableToObject(table);
  }
}
