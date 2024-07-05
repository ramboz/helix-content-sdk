export const asyncFilter = async (arr, predicate) => Promise.all(arr.map(predicate))
  .then((results) => arr.filter((_v, index) => results[index]));

  export const asyncFind = async (arr, predicate) => Promise.all(arr.map(predicate))
  .then((results) => arr.find((_v, index) => results[index]));