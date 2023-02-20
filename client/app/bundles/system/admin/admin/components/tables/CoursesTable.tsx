import { ReactElement } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';
import { CourseMiniEntity } from 'types/system/courses';
import { UserBasicMiniEntity } from 'types/users';

import Note from 'lib/components/core/Note';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

interface CoursesTableProps {
  courses: CourseMiniEntity[];
  renderRowActionComponent: (course: CourseMiniEntity) => ReactElement;
  className?: string;
}

const translations = defineMessages({
  searchText: {
    id: 'system.admin.admin.CoursesTable.searchText',
    defaultMessage: 'Search courses by its title or owner.',
  },
  fetchFilteredCoursesFailure: {
    id: 'system.admin.admin.CoursesTable.fetchFilteredCoursesFailure',
    defaultMessage: 'Failed to fetch courses.',
  },
});

const CoursesTable = (props: CoursesTableProps): JSX.Element => {
  const { courses, renderRowActionComponent } = props;
  const { t } = useTranslation();

  if (!courses?.length)
    return <Note message={t(translations.fetchFilteredCoursesFailure)} />;

  const renderOwnerLink = (owner: UserBasicMiniEntity): JSX.Element => {
    if (owner.id === -1 && owner.name === 'Deleted') {
      return (
        <li key={owner.id} className="list-none">
          {owner.name}
        </li>
      );
    }
    return (
      <li key={owner.id} className="list-none">
        <a href={`/users/${owner.id}`}>{owner.name}</a>
      </li>
    );
  };

  const columns: ColumnTemplate<CourseMiniEntity>[] = [
    {
      of: 'title',
      title: t(tableTranslations.name),
      sortable: true,
      searchable: true,
      cell: (course) => (
        <Typography
          key={`title-${course.id}`}
          className="course_title"
          variant="body2"
        >
          <a href={`//${course.instance.host}/courses/${course.id}`}>
            {course.title}
          </a>
        </Typography>
      ),
    },
    {
      of: 'createdAt',
      title: t(tableTranslations.createdAt),
      sortable: true,
      cell: (course) => (
        <Typography
          key={`createdAt-${course.id}`}
          className="course_created_at"
          variant="body2"
        >
          {course.createdAt}
        </Typography>
      ),
    },
    {
      of: 'activeUserCount',
      title: t(tableTranslations.activeUsers),
      sortable: true,
      cell: (course) => (
        <Typography
          key={`activeTotalUsers-${course.id}`}
          className="course_active_users"
          variant="body2"
        >
          <a
            href={`//${course.instance.host}/courses/${course.id}/students?active=true`}
          >
            {course.activeUserCount}
          </a>
        </Typography>
      ),
    },
    {
      of: 'userCount',
      title: t(tableTranslations.totalUsers),
      sortable: true,
      cell: (course) => (
        <Typography
          key={`activeTotalUsers-${course.id}`}
          className="course_total_users"
          variant="body2"
        >
          <a href={`//${course.instance.host}/courses/${course.id}/students`}>
            {course.userCount}
          </a>
        </Typography>
      ),
    },
    {
      of: 'instance',
      title: t(tableTranslations.instance),
      sortable: true,
      cell: (course) => (
        <a href={`//${course.instance.host}`}>
          <Typography
            key={`instance-${course.id}`}
            className="course_instance"
            variant="body2"
          >
            {course.instance.name}
          </Typography>
        </a>
      ),
    },
    {
      of: 'owners',
      title: t(tableTranslations.owners),
      sortable: true,
      searchable: true,
      cell: (course) => (
        <ul className="mb-0 pl-0">
          {course.owners.map((owner) => renderOwnerLink(owner))}
        </ul>
      ),
    },
    {
      id: 'actions',
      title: t(tableTranslations.actions),
      cell: (course) => renderRowActionComponent?.(course),
      unless: !renderRowActionComponent,
    },
  ];

  return (
    <Table
      className={props.className}
      columns={columns}
      data={courses}
      getRowClassName={(course): string => `instance_${course.id}`}
      getRowId={(course): string => course.id.toString()}
      pagination={{
        initialPagination: DEFAULT_TABLE_ROWS_PER_PAGE,
        rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
        showAllRows: true,
      }}
      search={{ searchPlaceholder: t(translations.searchText) }}
      toolbar={{
        show: true,
      }}
    />
  );
};

export default CoursesTable;
