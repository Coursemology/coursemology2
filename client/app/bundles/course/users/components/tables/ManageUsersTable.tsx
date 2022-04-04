import { memo, ReactElement, useMemo, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ExpandMore } from '@mui/icons-material';
import {
  Button,
  Menu,
  MenuItem,
  Switch,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import equal from 'fast-deep-equal';
import {
  TableColumns,
  TableDownloadOptions,
  TableOptions,
} from 'types/components/DataTable';
import {
  CourseUserMiniEntity,
  CourseUserRoles,
  CourseUserRowData,
} from 'types/course/courseUsers';
import { TimelineAlgorithm } from 'types/course/personalTimes';
import { TimelineData } from 'types/course/referenceTimelines';
import { AppDispatch } from 'types/store';

import DataTable from 'lib/components/core/layouts/DataTable';
import Note from 'lib/components/core/Note';
import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';
import {
  COURSE_USER_ROLES,
  DEFAULT_TABLE_ROWS_PER_PAGE,
  TIMELINE_ALGORITHMS,
} from 'lib/constants/sharedConstants';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import { assignToTimeline, updateUser } from '../../operations';
import { getManageCourseUserPermissions } from '../../selectors';

interface ManageUsersTableProps {
  title: string;
  users: CourseUserMiniEntity[];
  manageStaff?: boolean;
  renderRowActionComponent?: (
    user: CourseUserRowData,
    disabled: boolean,
  ) => ReactElement;
  csvDownloadOptions: TableDownloadOptions;
  timelinesMap?: Record<number, string>;
}

const translations = defineMessages({
  noUsers: {
    id: 'course.users.ManageUsersTable.ManageUsersTable.noUsers',
    defaultMessage: 'There are no users',
  },
  searchText: {
    id: 'course.users.ManageUsersTable.ManageUsersTable.searchText',
    defaultMessage: 'Search by name, email, role, etc.',
  },
  renameSuccess: {
    id: 'course.users.ManageUsersTable.renameSuccess',
    defaultMessage: '{oldName} was renamed to {newName}',
  },
  renameFailure: {
    id: 'course.users.ManageUsersTable.renameFailure',
    defaultMessage: 'Failed to rename {oldName} to {newName}',
  },
  phantomSuccess: {
    id: 'course.users.ManageUsersTable.phantomSuccess',
    defaultMessage:
      '{name} {isPhantom, select, ' +
      'true {is now a phantom user} ' +
      'other {is now a normal user} ' +
      '}.',
  },
  changeRoleSuccess: {
    id: 'course.users.ManageUsersTable.changeRoleSuccess',
    defaultMessage: "Updated {name}'s role to {role}.",
  },
  changeRoleFailure: {
    id: 'course.users.ManageUsersTable.changeRoleFailure',
    defaultMessage: "Failed to update {name}'s role to {role}.",
  },
  changeTimelineSuccess: {
    id: 'course.users.ManageUsersTable.changeTimelineSuccess',
    defaultMessage: "Updated {name}'s reference timeline to {timeline}.",
  },
  changeTimelineFailure: {
    id: 'course.users.ManageUsersTable.changeTimelineFailure',
    defaultMessage:
      "Failed to update {name}'s reference timeline to {timeline}.",
  },
  bulkChangeTimelineSuccess: {
    id: 'course.users.ManageUsersTable.bulkChangeTimelineSuccess',
    defaultMessage:
      "Updated {n, plural, =1 {# student''s} other {# students''}} reference timelines to {timeline}.",
  },
  bulkChangeTimelineFailure: {
    id: 'course.users.ManageUsersTable.bulkChangeTimelineFailure',
    defaultMessage:
      "Failed to update {n, plural, =1 {# student''s} other {# students''}} reference timelines to {timeline}.",
  },
  changeAlgorithmSuccess: {
    id: 'course.users.ManageUsersTable.changeAlgorithmSuccess',
    defaultMessage: "Updated {name}'s timeline algorithm to {timeline}.",
  },
  changeAlgorithmFailure: {
    id: 'course.users.ManageUsersTable.changeAlgorithmFailure',
    defaultMessage:
      "Failed to update {name}'s timeline algorithm to {timeline}.",
  },
  updateFailure: {
    id: 'course.users.ManageUsersTable.updateFailure',
    defaultMessage: 'Failed to update user - {error}',
  },
  defaultTimeline: {
    id: 'course.users.ManageUsersTable.defaultTimeline',
    defaultMessage: 'Default',
  },
  group: {
    id: 'course.users.ManageUsersTable.group',
    defaultMessage: 'Group: {name}',
  },
  selectedNStudents: {
    id: 'course.users.ManageUsersTable.selectedNStudents',
    defaultMessage: 'Selected {n, plural, =1 {# student} other {# students}}',
  },
  assignToTimeline: {
    id: 'course.users.ManageUsersTable.assignToTimeline',
    defaultMessage: 'Assign to timeline',
  },
});

const algorithms = TIMELINE_ALGORITHMS.map((option) => (
  <MenuItem key={option.value} id={option.value} value={option.value}>
    {option.label}
  </MenuItem>
));

const roles = Object.keys(COURSE_USER_ROLES).map((option) => (
  <MenuItem key={option} id={option} value={option}>
    {COURSE_USER_ROLES[option]}
  </MenuItem>
));

interface TableToolbarSelectProps {
  selectedRows: { data: { index: number; dataIndex: number }[] };
}

const ManageUsersTable = (props: ManageUsersTableProps): JSX.Element => {
  const { users, manageStaff, timelinesMap, renderRowActionComponent } = props;

  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const permissions = useSelector(getManageCourseUserPermissions);

  const [submitting, setSubmitting] = useState(false);
  const [filteringGroup, setFilteringGroup] = useState(false);

  const timelines = useMemo(
    () =>
      timelinesMap &&
      Object.entries(timelinesMap).map(([id, timelineTitle]) => (
        <MenuItem key={id} value={id}>
          {timelineTitle ?? t(translations.defaultTimeline)}
        </MenuItem>
      )),
    [timelinesMap],
  );

  const handleAssignUsersToTimeline = (
    ids: CourseUserMiniEntity['id'][],
    timelineId: TimelineData['id'],
    timelineTitle: TimelineData['title'],
  ): void => {
    setSubmitting(true);

    dispatch(assignToTimeline(ids, timelineId))
      .then(() => {
        toast.success(
          t(translations.bulkChangeTimelineSuccess, {
            n: ids.length,
            timeline: timelineTitle ?? t(translations.defaultTimeline),
          }),
        );
      })
      .catch(() => {
        toast.error(
          t(translations.bulkChangeTimelineFailure, {
            n: ids.length,
            timeline: timelineTitle ?? t(translations.defaultTimeline),
          }),
        );
      })
      .finally(() => setSubmitting(false));
  };

  const TableToolbarSelect = useMemo(() => {
    const ManageUsersTableActionBar = ({
      selectedRows,
    }: TableToolbarSelectProps): JSX.Element => {
      const rows = selectedRows.data;

      const [timelinesMenu, setTimelinesMenu] = useState<HTMLButtonElement>();

      return (
        <Toolbar className="justify-between">
          <Typography>
            {t(translations.selectedNStudents, { n: rows.length })}
          </Typography>

          {timelinesMap && (
            <>
              <Button
                disabled={submitting}
                endIcon={<ExpandMore />}
                onClick={(e): void => setTimelinesMenu(e.currentTarget)}
                size="small"
              >
                {t(translations.assignToTimeline)}
              </Button>

              <Menu
                anchorEl={timelinesMenu}
                onClose={(): void => setTimelinesMenu(undefined)}
                open={Boolean(timelinesMenu)}
              >
                {Object.entries(timelinesMap).map(([id, title]) => (
                  <MenuItem
                    key={id}
                    onClick={(): void => {
                      const timelineId = parseInt(id, 10);
                      const ids = rows.map(
                        ({ dataIndex }) => users[dataIndex].id,
                      );

                      handleAssignUsersToTimeline(ids, timelineId, title);
                    }}
                  >
                    {title ?? t(translations.defaultTimeline)}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Toolbar>
      );
    };

    ManageUsersTableActionBar.displayName = 'ManageUsersTableActionBar';

    return ManageUsersTableActionBar;
  }, [timelinesMap]);

  if (!users?.length) return <Note message={t(translations.noUsers)} />;

  const handleNameUpdate = (
    userId: CourseUserMiniEntity['id'],
    userName: CourseUserMiniEntity['name'],
    name: string,
  ): Promise<void> => {
    setSubmitting(true);

    return dispatch(updateUser(userId, { name }))
      .then(() => {
        toast.success(
          t(translations.renameSuccess, {
            oldName: userName,
            newName: name,
          }),
        );
      })
      .catch((error) => {
        toast.error(
          t(translations.renameFailure, {
            oldName: userName,
            newName: name,
            error: error.response?.data?.errors ?? '',
          }),
        );
      })
      .finally(() => setSubmitting(false));
  };

  const handlePhantomUpdate = (
    user: CourseUserMiniEntity,
    phantom: boolean,
  ): void => {
    setSubmitting(true);

    dispatch(updateUser(user.id, { phantom }))
      .then(() => {
        toast.success(
          t(translations.phantomSuccess, {
            name: user.name,
            isPhantom: phantom,
          }),
        );
      })
      .catch((error) => {
        toast.error(
          t(translations.updateFailure, {
            error: error.response?.data?.errors ?? '',
          }),
        );
      })
      .finally(() => setSubmitting(false));
  };

  const handleRoleUpdate = (
    userId: CourseUserMiniEntity['id'],
    userName: CourseUserMiniEntity['name'],
    role: CourseUserRoles,
    updateValue: (role: CourseUserRoles) => void,
  ): void => {
    setSubmitting(true);

    dispatch(updateUser(userId, { role }))
      .then(() => {
        updateValue(role);
        toast.success(
          t(translations.changeRoleSuccess, {
            name: userName,
            role: COURSE_USER_ROLES[role],
          }),
        );
      })
      .catch((error) => {
        toast.error(
          t(translations.changeRoleFailure, {
            name: userName,
            role: COURSE_USER_ROLES[role],
            error: error.response?.data?.errors ?? '',
          }),
        );
      })
      .finally(() => setSubmitting(false));
  };

  const handleAlgorithmUpdate = (
    userId: CourseUserMiniEntity['id'],
    userName: CourseUserMiniEntity['name'],
    timelineAlgorithm: TimelineAlgorithm,
    updateValue: (algorithm: TimelineAlgorithm) => void,
  ): void => {
    setSubmitting(true);

    dispatch(updateUser(userId, { timelineAlgorithm }))
      .then(() => {
        updateValue(timelineAlgorithm);
        toast.success(
          t(translations.changeAlgorithmSuccess, {
            name: userName,
            timeline:
              TIMELINE_ALGORITHMS.find(
                (timeline) => timeline.value === timelineAlgorithm,
              )?.label ?? 'Unknown',
          }),
        );
      })
      .catch((error) => {
        toast.error(
          t(translations.changeAlgorithmFailure, {
            name: userName,
            timeline:
              TIMELINE_ALGORITHMS.find(
                (timeline) => timeline.value === timelineAlgorithm,
              )?.label ?? 'Unknown',
            error: error.response.data.errors,
          }),
        );
      })
      .finally(() => setSubmitting(false));
  };

  const handleTimelineUpdate = (
    userId: CourseUserMiniEntity['id'],
    userName: CourseUserMiniEntity['name'],
    referenceTimelineId: number,
    timeline: string,
    updateValue: (id: number) => void,
  ): void => {
    setSubmitting(true);

    dispatch(updateUser(userId, { referenceTimelineId }))
      .then(() => {
        updateValue(referenceTimelineId);
        toast.success(
          t(translations.changeTimelineSuccess, { name: userName, timeline }),
        );
      })
      .catch(() => {
        toast.error(
          t(translations.changeTimelineFailure, { name: userName, timeline }),
        );
      })
      .finally(() => setSubmitting(false));
  };

  const options: TableOptions = {
    download: true,
    downloadOptions: props.csvDownloadOptions,
    onFilterChange: (_, filterList: string[]) =>
      setFilteringGroup(Boolean(filterList[5].length)),
    pagination: true,
    print: false,
    rowsPerPage: DEFAULT_TABLE_ROWS_PER_PAGE,
    rowsPerPageOptions: [DEFAULT_TABLE_ROWS_PER_PAGE],
    search: true,
    // TODO: Remove `!permissions.canManageReferenceTimelines` when adding another
    // action to `ManageUsersTableActionBar`
    selectableRows:
      manageStaff || !permissions.canManageReferenceTimelines
        ? 'none'
        : 'multiple',
    searchPlaceholder: t(translations.searchText),
    setTableProps: () => ({ size: 'small' }),
    setRowProps: (_, dataIndex): Record<string, unknown> => ({
      key: users[dataIndex].id,
      userid: users[dataIndex].id,
      className: `course_user course_user_${users[dataIndex].id}`,
    }),
    viewColumns: false,
  };

  const columns: TableColumns[] = [
    {
      name: 'id',
      label: '',
      options: {
        display: false,
        filter: false,
        sort: false,
        download: false,
      },
    },
    {
      name: 'name',
      label: t(tableTranslations.name),
      options: {
        alignCenter: false,
        filter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const userId = tableMeta.rowData[1];
          const userName = tableMeta.rowData[2];

          return (
            <InlineEditTextField
              key={userId}
              className="course_user_name"
              disabled={submitting}
              onUpdate={(newName): Promise<void> =>
                handleNameUpdate(userId, userName, newName)
              }
              updateValue={updateValue}
              value={value}
              variant="standard"
            />
          );
        },
      },
    },
    {
      name: 'email',
      label: t(tableTranslations.email),
      options: {
        alignCenter: false,
        filter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const user = users[dataIndex];

          return (
            <Typography
              key={user.id}
              className="course_user_email"
              variant="body2"
            >
              {user.email}
            </Typography>
          );
        },
      },
    },
    {
      name: 'phantom',
      label: t(tableTranslations.phantom),
      options: {
        filter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const user = users[dataIndex];

          return (
            <Switch
              key={user.id}
              checked={user.phantom}
              className="course_user_phantom"
              disabled={submitting}
              id={`phantom-${user.id}`}
              onChange={(event): void =>
                handlePhantomUpdate(user, event.target.checked)
              }
            />
          );
        },
      },
    },
    {
      name: 'groups',
      label: t(tableTranslations.groups),
      options: {
        display: filteringGroup,
        filterType: 'multiselect',
        filterOptions: {
          fullWidth: true,
          logic: (groups: string[], filters: string[]): boolean => {
            if (!filters.length) return false;

            const filterSet = new Set(filters);
            return !groups.some((group) => filterSet.has(group));
          },
        },
        customFilterListOptions: {
          render: (name: string) => t(translations.group, { name }),
        },
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const user = users[dataIndex];

          return (
            <ul className="list-none p-0">
              {user.groups?.map((group) => (
                <Typography key={group} component="li" variant="body2">
                  {group}
                </Typography>
              ))}
            </ul>
          );
        },
      },
    },
  ];

  if (permissions?.canManageReferenceTimelines && timelines && timelinesMap) {
    columns.push({
      name: 'referenceTimelineId',
      label: t(tableTranslations.referenceTimeline),
      options: {
        alignCenter: false,
        filter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const userId = tableMeta.rowData[1];
          const userName = tableMeta.rowData[2];

          return (
            <TextField
              key={userId}
              disabled={submitting}
              onChange={(e): void => {
                const timelineId = parseInt(e.target.value, 10);

                handleTimelineUpdate(
                  userId,
                  userName,
                  timelineId,
                  timelinesMap[timelineId] || t(translations.defaultTimeline),
                  updateValue,
                );
              }}
              select
              value={value}
              variant="standard"
            >
              {timelines}
            </TextField>
          );
        },
      },
    });
  }

  if (permissions?.canManagePersonalTimes) {
    columns.push({
      name: 'timelineAlgorithm',
      label: t(tableTranslations.timelineAlgorithm),
      options: {
        alignCenter: false,
        filter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const userId = tableMeta.rowData[1];
          const userName = tableMeta.rowData[2];

          return (
            <TextField
              key={userId}
              disabled={submitting}
              onChange={(e): void =>
                handleAlgorithmUpdate(
                  userId,
                  userName,
                  e.target.value as TimelineAlgorithm,
                  updateValue,
                )
              }
              select
              value={value}
              variant="standard"
            >
              {algorithms}
            </TextField>
          );
        },
      },
    });
  }

  if (manageStaff && permissions?.canManageCourseUsers) {
    columns.push({
      name: 'role',
      label: t(tableTranslations.role),
      options: {
        alignCenter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const userId = tableMeta.rowData[1];
          const userName = tableMeta.rowData[2];

          return (
            <TextField
              key={userId}
              className="course_user_role"
              disabled={submitting}
              onChange={(e): void =>
                handleRoleUpdate(
                  userId,
                  userName,
                  e.target.value as CourseUserRoles,
                  updateValue,
                )
              }
              select
              value={value}
              variant="standard"
            >
              {roles}
            </TextField>
          );
        },
      },
    });
  }

  if (renderRowActionComponent) {
    columns.push({
      name: 'actions',
      label: t(tableTranslations.actions),
      options: {
        filter: false,
        empty: true,
        sort: false,
        customBodyRender: (_, tableMeta): JSX.Element => {
          const rowData = tableMeta.rowData as CourseUserRowData;
          const user = rebuildObjectFromRow(columns, rowData);
          return renderRowActionComponent(user, submitting);
        },
        download: false,
      },
    });
  }

  return (
    <DataTable
      columns={columns}
      components={{ TableToolbarSelect }}
      data={users}
      includeRowNumber
      options={options}
      title={props.title}
      withMargin
    />
  );
};

export default memo(ManageUsersTable, (prevProps, nextProps) =>
  equal(prevProps.users, nextProps.users),
);
