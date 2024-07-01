import { FC } from 'react';
import { Typography } from '@mui/material';
import { AppDispatch } from 'store';

import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { Folder } from 'course/duplication/types';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import MaterialRow from './MaterialRow';

interface FolderTreeProps {
  folder: Folder;
  indentLevel: number;
}

const folderSetAll: (
  folder: Folder,
  dispatch: AppDispatch,
) => (value: boolean) => void = (folder, dispatch) => (value) => {
  dispatch(
    actions.setItemSelectedBoolean(
      duplicableItemTypes.FOLDER,
      folder.id,
      value,
    ),
  );
  folder.subfolders.forEach((subfolder) =>
    folderSetAll(subfolder, dispatch)(value),
  );
  folder.materials.forEach((material) => {
    dispatch(
      actions.setItemSelectedBoolean(
        duplicableItemTypes.MATERIAL,
        material.id,
        value,
      ),
    );
  });
};

const FolderTree: FC<FolderTreeProps> = (props) => {
  const dispatch = useAppDispatch();
  const duplication = useAppSelector(selectDuplicationStore);

  const { selectedItems } = duplication;
  const { folder, indentLevel } = props;
  const { id, name, materials, subfolders } = folder;
  const checked = !!selectedItems[duplicableItemTypes.FOLDER][folder.id];
  const hasChildren = materials.length + subfolders.length > 0;

  return (
    <div key={id}>
      <IndentedCheckbox
        label={
          <span className="flex flex-row items-center">
            <TypeBadge itemType={duplicableItemTypes.FOLDER} />
            <Typography className="font-bold">{name}</Typography>
          </span>
        }
        onChange={(_, value) =>
          dispatch(
            actions.setItemSelectedBoolean(
              duplicableItemTypes.FOLDER,
              id,
              value,
            ),
          )
        }
        {...{ checked, indentLevel }}
      >
        {hasChildren ? (
          <BulkSelectors callback={folderSetAll(folder, dispatch)} />
        ) : null}
      </IndentedCheckbox>
      {materials.map((material) => (
        <MaterialRow
          key={material.id}
          indentLevel={indentLevel + 1}
          material={material}
        />
      ))}
      {subfolders.map((subfolder) => (
        <FolderTree
          key={subfolder.id}
          folder={subfolder}
          indentLevel={indentLevel + 1}
        />
      ))}
    </div>
  );
};

export default FolderTree;
