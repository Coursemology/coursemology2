/* eslint-disable import/prefer-default-export, no-param-reassign */

export function nestFolders(folders) {
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
}
