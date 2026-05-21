import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent, ListSubheader } from '@mui/material';

import TypeBadge from 'course/duplication/components/TypeBadge';
import { selectDuplicationStore } from 'course/duplication/selectors';
import {
  DuplicationFolderData,
  DuplicationMaterialData,
} from 'course/duplication/types';
import componentTranslations from 'course/translations';
import IndentedCheckbox from 'lib/components/core/IndentedCheckbox';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const ROOT_CHILDREN_LEVEL = 1;

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

const MaterialsListing: FC = () => {
  const {
    materialsComponent: folders,
    selectedItems,
    destinationCourses,
    destinationCourseId,
  } = useAppSelector(selectDuplicationStore);
  const { t } = useTranslation();

  const targetRootFolder = destinationCourses.find(
    (c) => c.id === destinationCourseId,
  )?.rootFolder;

  if (!targetRootFolder) return null;

  const existingNames = targetRootFolder.subfolders
    .concat(targetRootFolder.materials)
    .map((name) => name.toLowerCase());

  const renderRow = (
    item: DuplicationFolderData | DuplicationMaterialData,
    itemType: 'FOLDER' | 'MATERIAL',
    indentLevel: number,
    nameConflict: boolean,
  ): JSX.Element => (
    <IndentedCheckbox
      key={`material_${item.id}`}
      checked
      indentLevel={indentLevel}
      label={
        <span>
          <TypeBadge itemType={itemType} />
          {item.name}
          {nameConflict && (
            <div>
              <small>{t(translations.nameConflictWarning)}</small>
            </div>
          )}
        </span>
      }
    />
  );

  const renderFolderTree = (
    folder: DuplicationFolderData,
    indentLevel: number,
  ): JSX.Element[] => {
    const checked = !!selectedItems.FOLDER[folder.id];
    const childrenIndentLevel = checked ? indentLevel + 1 : ROOT_CHILDREN_LEVEL;
    const nameConflict =
      indentLevel === ROOT_CHILDREN_LEVEL &&
      existingNames.includes(folder.name.toLowerCase());

    const folderNode = checked
      ? [renderRow(folder, 'FOLDER', indentLevel, nameConflict)]
      : [];
    const materialNodes = folder.materials
      .filter((m) => !!selectedItems.MATERIAL[m.id])
      .map((material) => {
        const materialNameConflict =
          childrenIndentLevel === ROOT_CHILDREN_LEVEL &&
          existingNames.includes(material.name.toLowerCase());
        return renderRow(
          material,
          'MATERIAL',
          childrenIndentLevel,
          materialNameConflict,
        );
      });
    const subfolderNodes = folder.subfolders.flatMap((subfolder) =>
      renderFolderTree(subfolder, childrenIndentLevel),
    );
    return [...folderNode, ...materialNodes, ...subfolderNodes];
  };

  const folderTrees = folders.flatMap((folder) =>
    renderFolderTree(folder, ROOT_CHILDREN_LEVEL),
  );
  if (folderTrees.length < 1) return null;

  return (
    <div>
      <ListSubheader disableSticky>
        {t(componentTranslations.course_materials_component)}
      </ListSubheader>
      <Card>
        <CardContent>
          <IndentedCheckbox disabled label={t(translations.root)} />
          {folderTrees}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialsListing;
