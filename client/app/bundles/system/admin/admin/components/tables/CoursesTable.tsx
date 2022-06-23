import { Box, Typography } from '@mui/material';
import { FC, ReactElement } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import tableTranslations from 'lib/components/tables/translations';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import DataTable from 'lib/components/DataTable';
import { CourseMiniEntity } from 'types/system/courses';
import { useSelector } from 'react-redux';
import { AppState } from 'types/store';
import { UserBasicMiniEntity } from 'types/users';
import { getAllCourseMiniEntities } from '../../selectors';

interface Props extends WrappedComponentProps {
  renderRowActionComponent: (course: CourseMiniEntity) => ReactElement;
}

const translations = defineMessages({
  searchText: {
    id: 'system.admin.components.tables.CoursesTable.searchPlaceholder',
    defaultMessage: 'Search course title, description or owners.',
  },
});

const styles = {
  list: {
    paddingLeft: 0,
    marginBottom: 0,
  },
  listItem: {
    listStyle: 'none',
  },
};

const CoursesTable: FC<Props> = (props) => {
  const { renderRowActionComponent, intl } = props;

  const courses = useSelector((state: AppState) =>
    getAllCourseMiniEntities(state),
  );

  const renderOwnerLink = (owner: UserBasicMiniEntity): JSX.Element => {
    if (owner.id === -1 && owner.name === 'Deleted') {
      return (
        <li key={owner.id} style={styles.listItem}>
          {owner.name}
        </li>
      );
    }
    return (
      <li key={owner.id} style={styles.listItem}>
        <a href={`/users/${owner.id}`}>{owner.name}</a>
      </li>
    );
  };

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: 30,
    rowsPerPageOptions: [15, 30, 50],
    search: true,
    searchPlaceholder: intl.formatMessage(translations.searchText),
    selectableRows: 'none',
    setTableProps: (): Record<string, unknown> => {
      return { size: 'small' };
    },
    setRowProps: (_row, dataIndex, _rowIndex): Record<string, unknown> => {
      return {
        key: `course_${courses[dataIndex].id}`,
        courseid: `course_${courses[dataIndex].id}`,
        className: `course course_${courses[dataIndex].id}`,
      };
    },
    sortOrder: {
      name: 'name',
      direction: 'asc',
    },
    viewColumns: false,
  };

  const columns: TableColumns[] = [
    {
      name: 'id',
      label: intl.formatMessage(tableTranslations.id),
      options: {
        display: false,
        filter: false,
        sort: false,
      },
    },
    {
      name: 'title',
      label: intl.formatMessage(tableTranslations.name),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const course = courses[dataIndex];
          return (
            <Typography
              variant="body2"
              key={`title-${course.id}`}
              className="course_title"
            >
              <a href={`/courses/${course.id}`}>{course.title}</a>
            </Typography>
          );
        },
      },
    },
    {
      name: 'createdAt',
      label: intl.formatMessage(tableTranslations.createdAt),
      options: {
        alignCenter: false,
        search: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const course = courses[dataIndex];
          return (
            <Typography
              key={`createdAt-${course.id}`}
              className="course_created_at"
              variant="body2"
            >
              {course.createdAt}
            </Typography>
          );
        },
      },
    },
    {
      name: 'activeTotalUsers',
      label: intl.formatMessage(tableTranslations.activeTotalUsers),
      options: {
        alignCenter: false,
        search: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const course = courses[dataIndex];
          return (
            <Typography
              key={`activeTotalUsers-${course.id}`}
              className="course_active_total_users"
              variant="body2"
            >
              {course.activeUserCount} / {course.userCount}
            </Typography>
          );
        },
      },
    },
    {
      name: 'instance',
      label: intl.formatMessage(tableTranslations.instance),
      options: {
        alignCenter: false,
        search: true,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const course = courses[dataIndex];
          return (
            <a href={`//${course.instance.host}`}>
              <Typography
                key={`instance-${course.id}`}
                className="course_instance"
                variant="body2"
              >
                {course.instance.name}
              </Typography>
            </a>
          );
        },
      },
    },
    {
      name: 'owners',
      label: intl.formatMessage(tableTranslations.owners),
      options: {
        alignCenter: false,
        search: true,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const course = courses[dataIndex];
          return (
            <ul style={styles.list}>
              {course.owners.map((owner) => renderOwnerLink(owner))}
            </ul>
          );
        },
      },
    },
    {
      name: 'actions',
      label: intl.formatMessage(tableTranslations.actions),
      options: {
        empty: true,
        sort: false,
        alignCenter: true,
        customBodyRender: (_value, tableMeta): JSX.Element => {
          const rowData = tableMeta.rowData as CourseMiniEntity;
          const course = rebuildObjectFromRow(columns, rowData);
          const actionComponent = renderRowActionComponent(course);
          return actionComponent;
        },
      },
    },
  ];

  return (
    <Box sx={{ margin: '12px 0px' }}>
      <DataTable
        title="Courses"
        data={courses}
        columns={columns}
        options={options}
      />
    </Box>
  );
};

export default injectIntl(CoursesTable);
