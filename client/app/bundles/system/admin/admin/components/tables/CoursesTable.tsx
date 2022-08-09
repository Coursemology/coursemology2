import { FC, ReactElement, useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import {
  TableColumns,
  TableOptions,
  TableState,
} from 'types/components/DataTable';
import tableTranslations from 'lib/translations/table';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import { debounceSearchRender } from 'mui-datatables';
import DataTable from 'lib/components/DataTable';
import { CourseMiniEntity } from 'types/system/courses';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import { UserBasicMiniEntity } from 'types/users';
import { getUrlParameter } from 'lib/helpers/url-helpers';
import { FIELD_DEBOUNCE_DELAY } from 'lib/constants/sharedConstants';
import LoadingOverlay from 'lib/components/LoadingOverlay';
import { getAdminCounts, getAllCourseMiniEntities } from '../../selectors';
import { indexCourses } from '../../operations';

interface Props extends WrappedComponentProps {
  title: string;
  renderRowActionComponent: (course: CourseMiniEntity) => ReactElement;
}

const translations = defineMessages({
  searchText: {
    id: 'system.admin.components.tables.CoursesTable.searchPlaceholder',
    defaultMessage: 'Search course title, description or owners.',
  },
  fetchFilteredCoursesFailure: {
    id: 'system.admin.courses.fetchFiltered.failure',
    defaultMessage: 'Failed to fetch courses.',
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
  const { title, renderRowActionComponent, intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const courses = useSelector((state: AppState) =>
    getAllCourseMiniEntities(state),
  );
  const counts = useSelector((state: AppState) => getAdminCounts(state));
  const active = getUrlParameter('active');

  const [tableState, setTableState] = useState<TableState>({
    count: counts.coursesCount,
    page: 1,
    searchText: '',
  });

  useEffect((): void => {
    setTableState({
      ...tableState,
      count: counts.coursesCount,
    });
  }, [counts]);

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

  const changePage = (page): void => {
    setIsLoading(true);
    setTableState({
      ...tableState,
      page,
    });
    dispatch(
      indexCourses({ 'filter[page_num]': page, 'filter[length]': 30, active }),
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

  const search = (page, searchText): void => {
    if (searchText !== null) {
      setIsLoading(true);
      dispatch(
        indexCourses({
          'filter[page_num]': page,
          'filter[length]': 100,
          active,
          search: searchText.trim(),
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
    }
  };

  const options: TableOptions = {
    count: tableState.count,
    customSearchRender: debounceSearchRender(FIELD_DEBOUNCE_DELAY),
    download: false,
    filter: false,
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
    rowsPerPage: 100,
    rowsPerPageOptions: [100],
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
        sort: false,
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
        sort: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const course = courses[dataIndex];
          return (
            <Typography
              key={`activeTotalUsers-${course.id}`}
              className="course_active_total_users"
              variant="body2"
            >
              <a href={`/courses/${course.id}/students`}>
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
        sort: false,
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
    <Box sx={{ margin: '12px 0px', position: 'relative' }}>
      {isLoading && <LoadingOverlay />}
      <DataTable
        title={
          <Typography variant="h6">
            {title}
            {isLoading && (
              <CircularProgress
                size={24}
                style={{ marginLeft: 15, position: 'relative', top: 4 }}
              />
            )}
          </Typography>
        }
        data={courses}
        columns={columns}
        options={options}
        includeRowNumber
      />
    </Box>
  );
};

export default injectIntl(CoursesTable);
