import {
  DUPLICABLE_ITEM_TYPES,
  DuplicableItemType,
  DuplicationFolderData,
} from './types';

export const nestFolders = (
  folders: DuplicationFolderData[],
): DuplicationFolderData[] => {
  const rootFolders: DuplicationFolderData[] = [];

  const idFolderHash: Record<number, DuplicationFolderData> = folders.reduce(
    (hash, folder) => {
      hash[folder.id] = { ...folder, subfolders: [] };
      return hash;
    },
    {},
  );

  Object.values(idFolderHash).forEach((folder) => {
    if (folder.parent_id === null) {
      rootFolders.push(folder);
    } else {
      idFolderHash[folder.parent_id].subfolders.push(folder);
    }
  });

  return rootFolders;
};

export const getEmptySelectedItems: () => Record<
  DuplicableItemType,
  Record<number, boolean>
> = () =>
  DUPLICABLE_ITEM_TYPES.reduce((hash, type) => {
    hash[type] = {};
    return hash;
  }, {}) as Record<DuplicableItemType, Record<number, boolean>>;

/**
 * Prepares the payload containing ids and types of items selected for duplication.
 *
 * @param {object} selectedItemsHash Maps types to hashes that indicate which items have been selected, e.g.
 *    { TAB: { 3: true, 4: false }, SURVEY: { 9: true }, CATEGORY: { 10: false } }
 * @return {object} Maps types to arrays with ids of items that have been selected, e.g.
 *    { TAB: [3], SURVEY: [9] }
 */
export const getItemsPayload = (
  selectedItemsHash: Record<DuplicableItemType, Record<number, boolean>>,
): Record<DuplicableItemType, string[]> =>
  Object.keys(selectedItemsHash).reduce((hash, key) => {
    const idsHash = selectedItemsHash[key];
    const idsArray = Object.keys(idsHash).reduce<string[]>(
      (selectedIds, id) => {
        if (idsHash[id]) {
          selectedIds.push(id);
        }
        return selectedIds;
      },
      [],
    );
    if (idsArray.length > 0) {
      hash[key] = idsArray;
    }
    return hash;
  }, {}) as Record<DuplicableItemType, string[]>;
