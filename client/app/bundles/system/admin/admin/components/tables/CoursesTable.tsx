import { FC, ReactElement, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { CircularProgress, Typography } from '@mui/material';
import { debounceSearchRender } from 'mui-datatables';
import {
  TableColumns,
  TableOptions,
  TableState,
} from 'types/components/DataTable';
import { AppDispatch, Operation } from 'types/store';
import { CourseMiniEntity } from 'types/system/courses';
import { InstanceAdminStats } from 'types/system/instance/users';
import { AdminStats, UserBasicMiniEntity } from 'types/users';

import DataTable from 'lib/components/core/layouts/DataTable';
import {
  DEFAULT_TABLE_ROWS_PER_PAGE,
  FIELD_DEBOUNCE_DELAY,
} from 'lib/constants/sharedConstants';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import tableTranslations from 'lib/translations/table';

interface Props extends WrappedComponentProps {
  filter: { active: boolean };
  courses: CourseMiniEntity[];
  courseCounts: AdminStats | InstanceAdminStats;
  title: string;
  renderRowActionComponent: (course: CourseMiniEntity) => ReactElement;
  indexOperation: (params?) => Operation;
}

const translations = defineMessages({
  searchText: {
    id: 'system.admin.admin.CoursesTable.searchText',
    defaultMessage: 'Search course title, description or owners.',
  },
  fetchFilteredCoursesFailure: {
    id: 'system.admin.admin.CoursesTable.fetchFilteredCoursesFailure',
    defaultMessage: 'Failed to fetch courses.',
  },
});

const CoursesTable: FC<Props> = (props) => {
  const {
    filter,
    courses,
    courseCounts,
    title,
    renderRowActionComponent,
    intl,
    indexOperation,
  } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const [tableState, setTableState] = useState<TableState>({
    count: courseCounts.coursesCount,
    page: 1,
    searchText: '',
  });

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

  const changePage = (page: number): void => {
    setIsLoading(true);
    dispatch(
      indexOperation({
        'filter[page_num]': page,
        'filter[length]': DEFAULT_TABLE_ROWS_PER_PAGE,
        active: filter.active,
      }),
    )
      .then(() =>
        setTableState({
          ...tableState,
          page,
        }),
      )
      .catch(() =>
        toast.error(
          intl.formatMessage(translations.fetchFilteredCoursesFailure),
        ),
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  const search = (page: number, searchText?: string): void => {
    setIsLoading(true);
    dispatch(
      indexOperation({
        'filter[page_num]': page,
        'filter[length]': DEFAULT_TABLE_ROWS_PER_PAGE,
        active: filter.active,
        search: searchText ? searchText.trim() : searchText,
      }),
    )
      .catch(() =>
        toast.error(
          intl.formatMessage(translations.fetchFilteredCoursesFailure),
        ),
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  const options: TableOptions = {
    count: tableState.count,
    customSearchRender: debounceSearchRender(FIELD_DEBOUNCE_DELAY),
    download: false,
    filter: false,
    jumpToPage: true,
    onTableChange: (action, newTableState) => {
      switch (action) {
        case 'search':
          search(newTableState.page! + 1, newTableState.searchText);
          break;
        case 'changePage':
          changePage(newTableState.page! + 1);
          break;
        default:
          break;
      }
    },
    pagination: true,
    print: false,
    rowsPerPage: DEFAULT_TABLE_ROWS_PER_PAGE,
    rowsPerPageOptions: [DEFAULT_TABLE_ROWS_PER_PAGE],
    search: true,
    searchPlaceholder: intl.formatMessage(translations.searchText),
    selectableRows: 'none',
    serverSide: true,
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
        sort: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const course = courses[dataIndex];
          return (
            <Typography
              key={`title-${course.id}`}
              className="course_title"
              variant="body2"
            >
              <a href={`//${course.instance.host}/courses/${course.id}`}>
                {course.title}
              </a>
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
        sort: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
        sort: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const course = courses[dataIndex];
          return (
            <Typography
              key={`activeTotalUsers-${course.id}`}
              className="course_active_total_users"
              variant="body2"
            >
              <a
                href={`//${course.instance.host}/courses/${course.id}/students`}
              >
                {course.activeUserCount} / {course.userCount}
              </a>
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
        sort: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
        sort: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const course = courses[dataIndex];
          return (
            <ul className="mb-0 pl-0">
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
          return renderRowActionComponent(course);
        },
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={courses}
      isLoading={isLoading}
      options={options}
      title={
        <Typography variant="h6">
          {title}
          {isLoading && (
            <CircularProgress className="relative top-1 ml-4" size={24} />
          )}
        </Typography>
      }
      withMargin
    />
  );
};

export default injectIntl(CoursesTable);
