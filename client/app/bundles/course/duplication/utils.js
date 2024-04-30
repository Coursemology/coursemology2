/* eslint-disable no-param-reassign */
import { duplicableItemTypes } from './constants';

export const flatten = (arr) => arr.reduce((a, b) => a.concat(b), []);

export const nestFolders = (folders) => {
  const rootFolders = [];

  const idFolderHash = folders.reduce((hash, folder) => {
    folder.subfolders = [];
    hash[folder.id] = folder;
    return hash;
  }, {});

  folders.forEach((folder) => {
    if (folder.parent_id === null) {
      rootFolders.push(folder);
    } else {
      idFolderHash[folder.parent_id].subfolders.push(folder);
    }
  });

  return rootFolders;
};

export const getEmptySelectedItems = () =>
  Object.keys(duplicableItemTypes).reduce((hash, type) => {
    hash[type] = {};
    return hash;
  }, {});

/**
 * Prepares the payload containing ids and types of items selected for duplication.
 *
 * @param {object} selectedItemsHash Maps types to hashes that indicate which items have been selected, e.g.
 *    { TAB: { 3: true, 4: false }, SURVEY: { 9: true }, CATEGORY: { 10: false } }
 * @return {object} Maps types to arrays with ids of items that have been selected, e.g.
 *    { TAB: [3], SURVEY: [9] }
 */
export const getItemsPayload = (selectedItemsHash) =>
  Object.keys(selectedItemsHash).reduce((hash, key) => {
    const idsHash = selectedItemsHash[key];
    const idsArray = Object.keys(idsHash).reduce((selectedIds, id) => {
      if (idsHash[id]) {
        selectedIds.push(id);
      }
      return selectedIds;
    }, []);
    if (idsArray.length > 0) {
      hash[key] = idsArray;
    }
    return hash;
  }, {});
