import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent, ListSubheader, Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { Folder, Material } from 'course/duplication/types';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const { FOLDER, MATERIAL } = duplicableItemTypes;
const ROOT_CHILDREN_LEVEL = 1;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const flatten = (arr) => arr.reduce((a, b) => a.concat(b), []);

const translations = defineMessages({
  root: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.MaterialsListing.root',
    defaultMessage: 'Root Folder',
  },
  nameConflictWarning: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.MaterialsListing.nameConflictWarning',
    defaultMessage:
      "Warning: Naming conflict exists. A serial number will be appended to the duplicated item's name.",
  },
});

const RootRowComponent: FC = () => {
  const { t } = useTranslation();
  return (
    <IndentedCheckbox
      disabled
      indentLevel={0}
      label={
        <Typography className="font-bold">{t(translations.root)}</Typography>
      }
    />
  );
};

interface RowProps {
  item: Material | Folder;
  itemType: typeof duplicableItemTypes;
  indentLevel: number;
  nameConflict: boolean;
}

const RowComponent: FC<RowProps> = (props) => {
  const { t } = useTranslation();
  const { item, itemType, indentLevel, nameConflict } = props;

  return (
    <IndentedCheckbox
      key={`material_${item.id}`}
      checked
      indentLevel={indentLevel}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={itemType} />
          <Typography className="font-bold">{item.name}</Typography>
          {nameConflict && (
            <Typography variant="caption">
              {t(translations.nameConflictWarning)}
            </Typography>
          )}
        </span>
      }
    />
  );
};

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
  const checked = !!selectedItems[FOLDER][folder.id];

  const childrenIndentLevel = checked ? indentLevel + 1 : ROOT_CHILDREN_LEVEL;
  const subfoldersNames = targetRootFolder.subfolders;
  const materialsNames = targetRootFolder.materials;
  const exisitingNames = subfoldersNames.concat(materialsNames);
  const nameConflict =
    indentLevel === ROOT_CHILDREN_LEVEL &&
    exisitingNames.includes(folder.name.toLowerCase());

  const folderNode = checked ? (
    <RowComponent
      indentLevel={indentLevel}
      item={folder}
      itemType={FOLDER}
      nameConflict={nameConflict}
    />
  ) : (
    <div />
  );

  const materialNodes = folder.materials
    .filter((material) => !!selectedItems[MATERIAL][material.id])
    .map((material) => {
      const materialNameConflict =
        childrenIndentLevel === ROOT_CHILDREN_LEVEL &&
        exisitingNames.includes(material.name.toLowerCase());
      return (
        <RowComponent
          key={material.id}
          indentLevel={childrenIndentLevel}
          item={material}
          itemType={MATERIAL}
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

const MaterialsListing: FC = () => {
  const { t } = useTranslation();
  const duplication = useAppSelector(selectDuplicationStore);

  const {
    materialsComponent: folders,
    selectedItems,
    destinationCourses,
  } = duplication;

  const targetRootFolder = destinationCourses.find(
    (course) => course.id === duplication.destinationCourseId,
  ).rootFolder;

  const folderTrees = flatten(
    folders.map((folder) => (
      <FolderTree
        key={folder.id}
        folder={folder}
        indentLevel={ROOT_CHILDREN_LEVEL}
        selectedItems={selectedItems}
        targetRootFolder={targetRootFolder}
      />
    )),
  );

  if (folderTrees.length < 1) {
    return null;
  }

  return (
    <div>
      <ListSubheader disableSticky>
        {t(defaultComponentTitles.course_materials_component)}
      </ListSubheader>
      <Card>
        <CardContent>
          <RootRowComponent />
          {folderTrees}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialsListing;
