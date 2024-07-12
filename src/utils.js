import { select, selectAll } from 'unist-util-select';
import between from 'unist-util-find-all-between';
import { findAllBefore } from 'unist-util-find-all-before';
import { findAllAfter } from 'unist-util-find-all-after';

export const asyncFilter = async (arr, predicate) => Promise.all(arr.map(predicate))
  .then((results) => arr.filter((_v, index) => results[index]));

export const asyncFind = async (arr, predicate) => Promise.all(arr.map(predicate))
  .then((results) => arr.find((_v, index) => results[index]));

export async function getBlockNameSelector(blockName) {
  return `table:has(text[value="${blockName}"],text[value="${blockName.toLowerCase()}"])`;
}

export function parseFilePath(fullPath) {
  const tokens = fullPath.split('/');
  const newName = tokens.pop();
  const destinationPath = tokens.join('/') || '/';
  return {
    name: newName,
    path: destinationPath
  };
}

export function colIndexToLetter(number) {
  return (number > 26 ? String.fromCharCode(64 + Math.floor(number / 26)) : '')
    + String.fromCharCode(64 + (number % 26))
}

export function getSectionsFromMdast(mdast) {
  const sectionBreaks = selectAll('thematicBreak', mdast);
  if (!sectionBreaks.length) {
    return [mdast.children];
  }
  const sections = [];
  sections.push(findAllBefore(mdast, mdast.children.indexOf(sectionBreaks[0])));
  for (let i = 1; i < sectionBreaks.length; i += 1) {
    sections.push(between(mdast, mdast.children.indexOf(sectionBreaks[i-1]), mdast.children.indexOf(sectionBreaks[i])));
  }
  sections.push(findAllAfter(mdast, sectionBreaks[sectionBreaks.length - 1]));
  return sections;
}

export function mdastTableToObject(table) {
  return Object.fromEntries(table.children.slice(1).map((r) => r.children.map((c) => c.children.map((p) => p.children.map((t) => t.value).join('\n')).join('\n'))));
}