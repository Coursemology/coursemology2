/**
 * Searches an array for the first object that has the given id and returns its index.
 *
 * @param {Object[]} array
 * @param {String|Number} id
 * @return {Number}
 */
export const findById = (array, id) => (
  array.findIndex(item => String(item.id) === String(id))
);

/**
 * Returns a copy of the given array with a given item updated if the item exists in the array.
 * Otherwise, returns a copy of the array with the item appended.
 * Items are identified by their 'id' property.
 *
 * @param {Object[]} array
 * @param {Object} item
 * @return {Object[]}
 */
export const updateOrAppend = (array, item) => {
  const index = findById(array, item.id);
  if (index === -1) {
    return [...array, item];
  }
  const updatedItem = { ...array[index], ...item };
  return Object.assign([], array, { [index]: updatedItem });
};

/**
 * Returns a copy of the given array with the object that has the given id removed.
 *
 * @param {Object[]} array
 * @param {String|Number} id
 * @return {Object[]}
 */
export const deleteIfFound = (array, id) => {
  const index = findById(array, id);
  if (index === -1) {
    return array;
  }
  const updatedArray = [...array];
  updatedArray.splice(index, 1);
  return updatedArray;
};
