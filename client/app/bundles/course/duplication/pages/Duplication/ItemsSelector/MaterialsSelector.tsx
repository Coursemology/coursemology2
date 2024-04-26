import { ListSubheader, Typography } from '@mui/material';
import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { Folder, Material } from 'course/duplication/types';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { AppDispatch } from 'store';

const { FOLDER, MATERIAL } = duplicableItemTypes;

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.MaterialsSelector.noItems',
    defaultMessage: 'There are no materials to duplicate.',
  },
});

const folderSetAll: (
  folder: Folder,
  dispatch: AppDispatch,
) => (value: boolean) => void = (folder, dispatch) => (value) => {
  dispatch(actions.setItemSelectedBoolean(FOLDER, folder.id, value));
  folder.subfolders.forEach((subfolder) =>
    folderSetAll(subfolder, dispatch)(value),
  );
  folder.materials.forEach((material) => {
    dispatch(actions.setItemSelectedBoolean(MATERIAL, material.id, value));
  });
};

interface MaterialProps {
  dispatch: AppDispatch;
  selectedItems: Record<string, Record<number, boolean>>;
  material: Material;
  indentLevel: number;
}

const MaterialComponent: FC<MaterialProps> = (props) => {
  const { dispatch, selectedItems, material, indentLevel } = props;
  const checked = !!selectedItems[MATERIAL][material.id];

  return (
    <IndentedCheckbox
      key={material.id}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={MATERIAL} />
          <Typography className="font-bold">{material.name}</Typography>
        </span>
      }
      onChange={(_, value) =>
        dispatch(actions.setItemSelectedBoolean(MATERIAL, material.id, value))
      }
      {...{ checked, indentLevel }}
    />
  );
};

interface FolderProps {
  dispatch: AppDispatch;
  selectedItems: Record<string, Record<number, boolean>>;
  folder: Folder;
  indentLevel: number;
}

const FolderComponent: FC<FolderProps> = (props) => {
  const { dispatch, selectedItems, folder, indentLevel } = props;
  const { id, name, materials, subfolders } = folder;
  const checked = !!selectedItems[FOLDER][folder.id];
  const hasChildren = materials.length + subfolders.length > 0;

  return (
    <div key={id}>
      <IndentedCheckbox
        label={
          <span className="flex flex-row items-center">
            <TypeBadge itemType={FOLDER} />
            <Typography className="font-bold">{name}</Typography>
          </span>
        }
        onChange={(_, value) =>
          dispatch(actions.setItemSelectedBoolean(FOLDER, id, value))
        }
        {...{ checked, indentLevel }}
      >
        {hasChildren ? (
          <BulkSelectors callback={folderSetAll(folder, dispatch)} />
        ) : null}
      </IndentedCheckbox>
      {materials.map((material) => (
        <MaterialComponent
          dispatch={dispatch}
          selectedItems={selectedItems}
          material={material}
          indentLevel={indentLevel + 1}
        />
      ))}
      {subfolders.map((subfolder) => (
        <FolderComponent
          dispatch={dispatch}
          selectedItems={selectedItems}
          folder={subfolder}
          indentLevel={indentLevel + 1}
        />
      ))}
    </div>
  );
};

const MaterialsSelector: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const duplication = useAppSelector(selectDuplicationStore);

  const { materialsComponent: folders, selectedItems } = duplication;

  return (
    <>
      <Typography className="mt-3 mb-1" variant="h6">
        {t(defaultComponentTitles.course_materials_component)}
      </Typography>
      {folders.length > 0 ? (
        folders.map((rootFolder) => (
          <FolderComponent
            dispatch={dispatch}
            selectedItems={selectedItems}
            folder={rootFolder}
            indentLevel={0}
          />
        ))
      ) : (
        <ListSubheader disableSticky>{t(translations.noItems)}</ListSubheader>
      )}
    </>
  );
};

export default MaterialsSelector;
