import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { ListSubheader, Typography } from '@mui/material';

import BulkSelectors from 'lib/components/core/BulkSelectors';
import IndentedCheckbox from 'lib/components/core/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { selectDuplicationStore } from 'course/duplication/selectors';
import { actions } from 'course/duplication/store';
import {
  DuplicationFolderData,
  DuplicationMaterialData,
} from 'course/duplication/types';
import componentTranslations from 'course/translations';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.MaterialsSelector.noItems',
    defaultMessage: 'There are no materials to duplicate.',
  },
});

const MaterialsSelector: FC = () => {
  const { materialsComponent: folders, selectedItems } = useAppSelector(
    selectDuplicationStore,
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  if (!folders) return null;

  const folderSetAll =
    (folder: DuplicationFolderData) =>
    (value: boolean): void => {
      dispatch(actions.setItemSelectedBoolean('FOLDER', folder.id, value));
      folder.subfolders.forEach((subfolder) => folderSetAll(subfolder)(value));
      folder.materials.forEach((material) => {
        dispatch(
          actions.setItemSelectedBoolean('MATERIAL', material.id, value),
        );
      });
    };

  const renderMaterial = (
    material: DuplicationMaterialData,
    indentLevel: number,
  ): JSX.Element => {
    const checked = !!selectedItems.MATERIAL[material.id];
    return (
      <IndentedCheckbox
        key={material.id}
        checked={checked}
        indentLevel={indentLevel}
        label={
          <span>
            <TypeBadge itemType="MATERIAL" />
            {material.name}
          </span>
        }
        onChange={(_, value) =>
          dispatch(
            actions.setItemSelectedBoolean('MATERIAL', material.id, value),
          )
        }
      />
    );
  };

  const renderFolder = (
    folder: DuplicationFolderData,
    indentLevel: number,
  ): JSX.Element => {
    const { id, name, materials, subfolders } = folder;
    const checked = !!selectedItems.FOLDER[id];
    const hasChildren = materials.length + subfolders.length > 0;

    return (
      <div key={id}>
        <IndentedCheckbox
          checked={checked}
          indentLevel={indentLevel}
          label={
            <span>
              <TypeBadge itemType="FOLDER" />
              {name}
            </span>
          }
          onChange={(_, value) =>
            dispatch(actions.setItemSelectedBoolean('FOLDER', id, value))
          }
        >
          {hasChildren ? (
            <BulkSelectors callback={folderSetAll(folder)} />
          ) : null}
        </IndentedCheckbox>
        {materials.map((material) => renderMaterial(material, indentLevel + 1))}
        {subfolders.map((subfolder) =>
          renderFolder(subfolder, indentLevel + 1),
        )}
      </div>
    );
  };

  return (
    <>
      <Typography className="mt-5 mb-5" variant="h2">
        {t(componentTranslations.course_materials_component)}
      </Typography>
      {folders.length > 0 ? (
        folders.map((rootFolder) => renderFolder(rootFolder, 0))
      ) : (
        <ListSubheader disableSticky>{t(translations.noItems)}</ListSubheader>
      )}
    </>
  );
};

export default MaterialsSelector;
