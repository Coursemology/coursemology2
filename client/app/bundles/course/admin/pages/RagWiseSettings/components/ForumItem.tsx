import { FC, memo } from 'react';
import { Divider, ListItem, ListItemText } from '@mui/material';
import equal from 'fast-deep-equal';
import { ForumImport } from 'types/course/admin/ragWise';

import Link from 'lib/components/core/Link';
import { getForumURL } from 'lib/helpers/url-builders';

import { FORUM_SWITCH_TYPE } from '../constants';

import ForumKnowledgeBaseSwitch from './buttons/ForumKnowledgeBaseSwitch';

interface ForumItemProps {
  forumImport: ForumImport;
  canManageForumImport: boolean;
  level: number;
}

const ForumItem: FC<ForumItemProps> = (props) => {
  const { forumImport, canManageForumImport, level } = props;

  return (
    <>
      <ListItem className="flex justify-between">
        <Link
          className="line-clamp-2 xl:line-clamp-1"
          opensInNewTab
          style={{ paddingLeft: `${level - 1}rem` }}
          to={getForumURL(forumImport.courseId, forumImport.id)}
          underline="hover"
        >
          <ListItemText primary={forumImport.name} />
        </Link>
        <ForumKnowledgeBaseSwitch
          canMangeForumImport={canManageForumImport}
          className="mr-1"
          forumImports={[forumImport]}
          type={FORUM_SWITCH_TYPE.forum_import}
        />
      </ListItem>
      <Divider className="border-neutral-200 last:border-none" />
    </>
  );
};

export default memo(ForumItem, equal);
