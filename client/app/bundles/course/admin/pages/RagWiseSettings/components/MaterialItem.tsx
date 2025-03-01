import { FC, memo } from 'react';
import { Divider, ListItem, ListItemText } from '@mui/material';
import equal from 'fast-deep-equal';
import { Material } from 'types/course/admin/ragWise';

import Link from 'lib/components/core/Link';

import { MATERIAL_SWITCH_TYPE } from '../constants';

import MaterialKnowledgeBaseSwitch from './buttons/MaterialKnowledgeBaseSwitch';

interface MaterialItemProps {
  material: Material;
  level: number;
}

const MaterialItem: FC<MaterialItemProps> = (props) => {
  const { material, level } = props;

  return (
    <>
      <ListItem className="flex justify-between">
        <Link
          className="line-clamp-2 xl:line-clamp-1"
          opensInNewTab
          style={{ paddingLeft: `${level - 1}rem` }}
          to={material.materialUrl}
          underline="hover"
        >
          <ListItemText primary={material.name} />
        </Link>
        <MaterialKnowledgeBaseSwitch
          className="mr-1"
          materials={[material]}
          type={MATERIAL_SWITCH_TYPE.material}
        />
      </ListItem>
      <Divider className="border-neutral-200 last:border-none" />
    </>
  );
};

export default memo(MaterialItem, equal);
