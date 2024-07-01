import { FC } from 'react';

import { duplicableItemTypes } from 'course/duplication/constants';
import { Folder } from 'course/duplication/types';
import { flatten } from 'course/duplication/utils';

import ComponentRow from './ComponentRow';

const ROOT_CHILDREN_LEVEL = 1;

interface FolderTreeProps {
  folder: Folder;
  indentLevel: number;
  selectedItems: Record<string, Record<number, boolean>>;
  targetRootFolder: {
    subfolders: string[];
    materials: string[];
  };
}

const FolderTree: FC<FolderTreeProps> = (props) => {
  const { folder, targetRootFolder, indentLevel, selectedItems } = props;
  const checked = !!selectedItems[duplicableItemTypes.FOLDER][folder.id];

  const childrenIndentLevel = checked ? indentLevel + 1 : ROOT_CHILDREN_LEVEL;
  const subfoldersNames = targetRootFolder.subfolders;
  const materialsNames = targetRootFolder.materials;
  const exisitingNames = subfoldersNames.concat(materialsNames);
  const nameConflict =
    indentLevel === ROOT_CHILDREN_LEVEL &&
    exisitingNames.includes(folder.name.toLowerCase());

  const folderNode = checked ? (
    <ComponentRow
      indentLevel={indentLevel}
      item={folder}
      itemType={duplicableItemTypes.FOLDER}
      nameConflict={nameConflict}
    />
  ) : (
    <div />
  );

  const materialNodes = folder.materials
    .filter(
      (material) => !!selectedItems[duplicableItemTypes.MATERIAL][material.id],
    )
    .map((material) => {
      const materialNameConflict =
        childrenIndentLevel === ROOT_CHILDREN_LEVEL &&
        exisitingNames.includes(material.name.toLowerCase());
      return (
        <ComponentRow
          key={material.id}
          indentLevel={childrenIndentLevel}
          item={material}
          itemType={duplicableItemTypes.MATERIAL}
          nameConflict={materialNameConflict}
        />
      );
    });

  const subfolderNodes = flatten(
    folder.subfolders.map((subfolder) => (
      <FolderTree
        key={subfolder.id}
        folder={subfolder}
        indentLevel={childrenIndentLevel}
        selectedItems={selectedItems}
        targetRootFolder={targetRootFolder}
      />
    )),
  );

  return flatten([folderNode, materialNodes, subfolderNodes]);
};

export default FolderTree;
