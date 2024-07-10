export const asyncFilter = async (arr, predicate) => Promise.all(arr.map(predicate))
  .then((results) => arr.filter((_v, index) => results[index]));

export const asyncFind = async (arr, predicate) => Promise.all(arr.map(predicate))
  .then((results) => arr.find((_v, index) => results[index]));

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