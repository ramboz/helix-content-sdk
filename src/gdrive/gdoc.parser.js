function parseTableCell(c, document, cb) {
  c.content.forEach((el) => parseStructuralElement(el, document, cb));
}

function parseTableRow(r, document, cb) {
  r.tableCells.forEach((el) => parseTableCell(el, document, cb));
}

function parseTable(t, document, cb) {
  t.table.tableRows.forEach((el) => parseTableRow(el, document, cb));
}

function parseText(t, document, cb) {
  if (t.textRun.content.trim()) {
    cb('text', t.textRun.content, t);
  }
}

function parseParagraph(p, document, cb) {
  p.paragraph.elements.forEach((el) => parseStructuralElement(el, document, cb));
}

function parseImage(i, document, cb) {
  cb('image', i.imageProperties.contentUri);
}

function parseObject(o, document, cb) {
  const obj = document.inlineObjects[o.inlineObjectElement.inlineObjectId];
  if (obj.inlineObjectProperties.embeddedObject.imageProperties) {
    parseImage(obj.inlineObjectProperties.embeddedObject, document, cb);
  }
}

function parseStructuralElement(el, document, cb) {
  if (el.table) {
    parseTable(el, document, cb);
  } else if (el.paragraph) {
    parseParagraph(el, document, cb);
  } else if (el.textRun) {
    parseText(el, document, cb);
  } else if (el.inlineObjectElement) {
    parseObject(el, document, cb);
  } else if (el.sectionBreak) {
    // ignore those
  } else {
    console.error('unsupported node', el);
  }
}

function parseBody(body, document, cb) {
  body.content.forEach((el) => parseStructuralElement(el, document, cb));
}

export default function parse(document, cb) {
  parseBody(document.body, document, cb);
}