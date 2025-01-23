import { FC, memo } from 'react';
import { Divider, ListItem, ListItemText } from '@mui/material';
import equal from 'fast-deep-equal';
import { Material } from 'types/course/admin/ragWise';

import Link from 'lib/components/core/Link';

import KnowledgeBaseSwitch from './buttons/KnowledgeBaseSwitch';

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
        <div className="mr-1">
          <KnowledgeBaseSwitch material={material} />
        </div>
      </ListItem>
      <Divider className="border-neutral-200 last:border-none" />
    </>
  );
};

export default memo(MaterialItem, equal);
