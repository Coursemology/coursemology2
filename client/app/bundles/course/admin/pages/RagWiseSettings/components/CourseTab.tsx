import { FC, memo } from 'react';
import { ListItemText } from '@mui/material';
import equal from 'fast-deep-equal';
import { Course } from 'types/course/admin/ragWise';

import Link from 'lib/components/core/Link';
import { getCourseURL } from 'lib/helpers/url-builders';
import { useAppSelector } from 'lib/hooks/store';

import { FORUM_SWITCH_TYPE } from '../constants';
import {
  getCourseExpandedSettings,
  getForumImportsByCourseId,
} from '../selectors';

import ForumKnowledgeBaseSwitch from './buttons/ForumKnowledgeBaseSwitch';
import CollapsibleList from './lists/CollapsibleList';
import ForumItem from './ForumItem';

interface CourseTabProps {
  course: Course;
  level: number;
}

const CourseTab: FC<CourseTabProps> = (props) => {
  const { course, level } = props;
  const isCourseExpanded = useAppSelector(getCourseExpandedSettings);
  const forumImports = useAppSelector((state) =>
    getForumImportsByCourseId(state, course?.id),
  );

  return (
    <CollapsibleList
      collapsedByDefault
      forceExpand={isCourseExpanded}
      headerAction={
        <ForumKnowledgeBaseSwitch
          canMangeForumImport={course.canManageCourse}
          className="mr-7"
          forumImports={forumImports}
          type={FORUM_SWITCH_TYPE.course}
        />
      }
      headerTitle={
        <Link
          onClick={(e): void => e.stopPropagation()}
          opensInNewTab
          to={getCourseURL(course.id)}
          underline="hover"
        >
          <ListItemText
            classes={{ primary: 'font-bold' }}
            primary={course.name}
          />
        </Link>
      }
      level={level}
    >
      <>
        {forumImports.map((forumImport) => (
          <ForumItem
            key={forumImport.id}
            canManageForumImport={course.canManageCourse}
            forumImport={forumImport}
            level={level}
          />
        ))}
      </>
    </CollapsibleList>
  );
};

export default memo(CourseTab, equal);
