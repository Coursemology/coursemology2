import { ReactElement } from 'react';
import { defineMessages } from 'react-intl';
import { CourseMiniEntity } from 'types/system/courses';
import { UserBasicMiniEntity } from 'types/users';

import Link from 'lib/components/core/Link';
import Note from 'lib/components/core/Note';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDate } from 'lib/moment';
import tableTranslations from 'lib/translations/table';

interface CoursesTableProps {
  courses: CourseMiniEntity[];
  renderRowActionComponent: (course: CourseMiniEntity) => ReactElement;
  className?: string;
}

const translations = defineMessages({
  searchText: {
    id: 'system.admin.admin.CoursesTable.searchText',
    defaultMessage: 'Search courses by title or owner',
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
        <Link to={`/users/${owner.id}`} underline="hover">
          {owner.name}
        </Link>
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
        <Link
          href={`//${course.instance.host}/courses/${course.id}`}
          underline="hover"
        >
          {course.title}
        </Link>
      ),
    },
    {
      of: 'createdAt',
      title: t(tableTranslations.createdAt),
      sortable: true,
      cell: (course) => formatLongDate(course.createdAt),
      sortProps: {
        sort: (a, b): number =>
          Date.parse(a.createdAt) - Date.parse(b.createdAt),
      },
    },
    {
      of: 'activeUserCount',
      title: t(tableTranslations.activeUsers),
      sortable: true,
      cell: (course) => (
        <Link
          href={`//${course.instance.host}/courses/${course.id}/students?active=true`}
          underline="hover"
        >
          {course.activeUserCount}
        </Link>
      ),
    },
    {
      of: 'userCount',
      title: t(tableTranslations.totalUsers),
      sortable: true,
      cell: (course) => (
        <Link
          href={`//${course.instance.host}/courses/${course.id}/students`}
          underline="hover"
        >
          {course.userCount}
        </Link>
      ),
    },
    {
      of: 'instance',
      title: t(tableTranslations.instance),
      sortable: true,
      cell: (course) => (
        <Link href={`//${course.instance.host}`} underline="hover">
          {course.instance.name}
        </Link>
      ),
      searchProps: { getValue: (course) => course.instance.name },
    },
    {
      of: 'owners',
      title: t(tableTranslations.owners),
      sortable: true,
      searchable: true,
      cell: (course) => (
        <ul className="mb-0 pl-0">{course.owners.map(renderOwnerLink)}</ul>
      ),
      searchProps: {
        getValue: (course) =>
          course.owners.map((owner) => owner.name).join(';'),
      },
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
      getRowClassName={(course): string => `course_${course.id}`}
      getRowEqualityData={(course): CourseMiniEntity => course}
      getRowId={(course): string => course.id.toString()}
      indexing={{ indices: true }}
      pagination={{
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
