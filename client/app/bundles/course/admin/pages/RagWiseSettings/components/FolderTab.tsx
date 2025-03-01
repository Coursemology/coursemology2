import { FC, memo } from 'react';
import { ListItemText } from '@mui/material';
import equal from 'fast-deep-equal';
import { Folder } from 'types/course/admin/ragWise';

import Link from 'lib/components/core/Link';
import { getCourseId } from 'lib/helpers/url-helpers';
import useItems from 'lib/hooks/items/useItems';
import { useAppSelector } from 'lib/hooks/store';

import { MATERIAL_SWITCH_TYPE } from '../constants';
import {
  getFolderExpandedSettings,
  getMaterialByFolderId,
  getSubfolder,
} from '../selectors';

import MaterialKnowledgeBaseSwitch from './buttons/MaterialKnowledgeBaseSwitch';
import CollapsibleList from './lists/CollapsibleList';
import MaterialItem from './MaterialItem';

interface FolderTabProps {
  folder: Folder;
  level: number;
}

export const sortItems = <T extends { name: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => (a.name > b.name ? 1 : -1));
};

const FolderTab: FC<FolderTabProps> = (props) => {
  const { folder, level } = props;
  const materials = useAppSelector((state) =>
    getMaterialByFolderId(state, folder.id),
  );
  const { processedItems: sortedMaterials } = useItems(
    materials,
    [],
    sortItems,
  );
  const subfolders = useAppSelector((state) => getSubfolder(state, folder.id));
  const { processedItems: sortedSubfolders } = useItems(
    subfolders,
    [],
    sortItems,
  );
  const isFolderExpanded = useAppSelector(getFolderExpandedSettings);

  return (
    <CollapsibleList
      collapsedByDefault
      forceExpand={isFolderExpanded}
      headerAction={
        <MaterialKnowledgeBaseSwitch
          className="mr-7"
          materials={materials}
          type={MATERIAL_SWITCH_TYPE.folder}
        />
      }
      headerTitle={
        <Link
          onClick={(e): void => e.stopPropagation()}
          opensInNewTab
          to={`/courses/${getCourseId()}/materials/folders/${folder.id}/`}
          underline="hover"
        >
          <ListItemText
            classes={{ primary: 'font-bold' }}
            primary={folder.name}
          />
        </Link>
      }
      level={level}
    >
      <>
        {sortedMaterials.map((material) => (
          <MaterialItem key={material.id} level={level} material={material} />
        ))}
        {sortedSubfolders.map((subfolder) => (
          <FolderTab key={subfolder.id} folder={subfolder} level={level + 1} />
        ))}
      </>
    </CollapsibleList>
  );
};

export default memo(FolderTab, equal);
