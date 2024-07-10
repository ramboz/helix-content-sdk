import { select, selectAll } from 'unist-util-select';
import between from 'unist-util-find-all-between';
import { findAllAfter } from 'unist-util-find-all-after';
import ClientInterface from './client.interface.js';
import { getBlockNameSelector } from './utils.js';

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
    return this.getBlock(docPath, 'Metadata');
  }

  async getSection(docPath, sectionIndex) {
    const sections = await this.getSections(docPath);
    return sections ? sections[sectionIndex] : null;
  }

  async getSections(docPath) {
    const tree = await this.getDocument(docPath);
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
}
