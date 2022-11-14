import { FC, memo, ReactElement } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Checkbox, MenuItem, TextField, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import {
  TableColumns,
  TableDownloadOptions,
  TableOptions,
} from 'types/components/DataTable';
import {
  CourseUserMiniEntity,
  CourseUserRole,
  CourseUserRowData,
} from 'types/course/courseUsers';
import { TimelineAlgorithm } from 'types/course/personalTimes';
import { AppDispatch, AppState } from 'types/store';

import DataTable from 'lib/components/core/layouts/DataTable';
import Note from 'lib/components/core/Note';
import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';
import {
  COURSE_USER_ROLES,
  TABLE_ROWS_PER_PAGE,
  TIMELINE_ALGORITHMS,
} from 'lib/constants/sharedConstants';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import tableTranslations from 'lib/translations/table';

import { updateUser } from '../../operations';
import { getManageCourseUserPermissions } from '../../selectors';

interface Props extends WrappedComponentProps {
  title: string;
  users: CourseUserMiniEntity[];
  manageStaff?: boolean;
  renderRowActionComponent?: (user: CourseUserRowData) => ReactElement;
  csvDownloadOptions: TableDownloadOptions;
}

const translations = defineMessages({
  noUsers: {
    id: 'course.users.components.tables.ManageUsersTable.noUsers',
    defaultMessage: 'There are no users',
  },
  searchText: {
    id: 'course.users.components.tables.ManageUsersTable.searchText',
    defaultMessage: 'Search by name, email, role, etc.',
  },
  renameSuccess: {
    id: 'course.users.rename.success',
    defaultMessage: '{oldName} was renamed to {newName}',
  },
  renameFailure: {
    id: 'course.users.rename.failure',
    defaultMessage: 'Failed to rename {oldName} to {newName}',
  },
  phantomSuccess: {
    id: 'course.user.phantom.success',
    defaultMessage:
      '{name} {isPhantom, select, ' +
      'true {is now a phantom user} ' +
      'other {is now a normal user} ' +
      '}.',
  },
  changeRoleSuccess: {
    id: 'course.user.changeRole.success',
    defaultMessage: "Successfully changed {name}'s role to {role}.",
  },
  changeRoleFailure: {
    id: 'course.user.changeRole.failure',
    defaultMessage: "Failed to change {name}'s role to {role}.",
  },
  changeTimelineSuccess: {
    id: 'course.user.changeTimeline.success',
    defaultMessage:
      "Successfully changed {name}'s timeline algorithm to {timeline}.",
  },
  changeTimelineFailure: {
    id: 'course.user.changeTimeline.failure',
    defaultMessage:
      "Failed to change {name}'s timeline algorithm to {timeline}.",
  },
  updateFailure: {
    id: 'course.user.update.fail',
    defaultMessage: 'Failed to update user - {error}',
  },
});

const styles = {
  checkbox: {
    margin: '0px 12px 0px 0px',
    padding: 0,
  },
};

const ManageUsersTable: FC<Props> = (props) => {
  const {
    title,
    users,
    manageStaff = false,
    renderRowActionComponent = null,
    intl,
    csvDownloadOptions,
  } = props;
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  if (users && users.length === 0) {
    return <Note message={<FormattedMessage {...translations.noUsers} />} />;
  }

  const handleNameUpdate = (rowData, newName: string): Promise<void> => {
    const user = rebuildObjectFromRow(
      columns, // eslint-disable-line @typescript-eslint/no-use-before-define
      rowData,
    ) as CourseUserMiniEntity;
    const newUser = {
      ...user,
      name: newName,
    };
    return dispatch(updateUser(rowData[1], newUser))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.renameSuccess, {
            oldName: user.name,
            newName,
          }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.renameFailure, {
            oldName: user.name,
            newName,
            error: errorMessage,
          }),
        );
        throw error;
      });
  };

  const handlePhantomUpdate = (
    user: CourseUserMiniEntity,
    newValue: boolean,
  ): Promise<void> => {
    const newUser = {
      ...user,
      phantom: newValue,
    };
    return dispatch(updateUser(user.id, newUser))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.phantomSuccess, {
            name: user.name,
            isPhantom: newValue,
          }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.updateFailure, {
            error: errorMessage,
          }),
        );
      });
  };

  const handleRoleUpdate = (
    rowData,
    newRole: string,
    updateValue,
  ): Promise<void> => {
    const user = rebuildObjectFromRow(
      columns, // eslint-disable-line @typescript-eslint/no-use-before-define
      rowData,
    ) as CourseUserMiniEntity;
    const newUser = {
      ...user,
      role: newRole as CourseUserRole,
    };
    return dispatch(updateUser(user.id, newUser))
      .then(() => {
        updateValue(newRole);
        toast.success(
          intl.formatMessage(translations.changeRoleSuccess, {
            name: user.name,
            role: COURSE_USER_ROLES[newRole],
          }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.changeRoleFailure, {
            name: user.name,
            role: COURSE_USER_ROLES[newRole],
            error: errorMessage,
          }),
        );
      });
  };

  const handleTimelineUpdate = (
    rowData,
    newTimeline: string,
    updateValue,
  ): Promise<void> => {
    const user = rebuildObjectFromRow(
      columns, // eslint-disable-line @typescript-eslint/no-use-before-define
      rowData,
    ) as CourseUserMiniEntity;
    const newUser = {
      ...user,
      timelineAlgorithm: newTimeline as TimelineAlgorithm,
    };
    return dispatch(updateUser(user.id, newUser))
      .then(() => {
        updateValue(newTimeline);
        toast.success(
          intl.formatMessage(translations.changeTimelineSuccess, {
            name: user.name,
            timeline:
              TIMELINE_ALGORITHMS.find(
                (timeline) => timeline.value === newTimeline,
              )?.label ?? 'Unknown',
          }),
        );
      })
      .catch((error) => {
        toast.error(
          intl.formatMessage(translations.changeTimelineFailure, {
            name: user.name,
            timeline:
              TIMELINE_ALGORITHMS.find(
                (timeline) => timeline.value === newTimeline,
              )?.label ?? 'Unknown',
            error: error.response.data.errors,
          }),
        );
      });
  };

  const options: TableOptions = {
    download: true,
    downloadOptions: csvDownloadOptions,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: TABLE_ROWS_PER_PAGE,
    rowsPerPageOptions: [TABLE_ROWS_PER_PAGE],
    search: true,
    searchPlaceholder: intl.formatMessage(translations.searchText),
    selectableRows: 'none',
    setTableProps: (): object => {
      return { size: 'small' };
    },
    setRowProps: (_row, dataIndex, _rowIndex): Record<string, unknown> => {
      return {
        key: `user_${users[dataIndex].id}`,
        userid: `user_${users[dataIndex].id}`,
        className: `course_user course_user_${users[dataIndex].id}`,
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
        download: false,
      },
    },
    {
      name: 'name',
      label: intl.formatMessage(tableTranslations.name),
      options: {
        alignCenter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const userId = tableMeta.rowData[0];
          return (
            <InlineEditTextField
              key={`name-${userId}`}
              className="course_user_name"
              onUpdate={(newName): Promise<void> =>
                handleNameUpdate(tableMeta.rowData, newName)
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
      label: intl.formatMessage(tableTranslations.email),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const user = users[dataIndex];
          return (
            <Typography
              key={`email-${user.id}`}
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
      label: intl.formatMessage(tableTranslations.phantom),
      options: {
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const user = users[dataIndex];
          return (
            <Checkbox
              key={`phantom-${user.id}`}
              checked={user.phantom}
              className="course_user_phantom"
              id={`phantom-${user.id}`}
              onChange={(event): Promise<void> =>
                handlePhantomUpdate(user, event.target.checked)
              }
              style={styles.checkbox}
            />
          );
        },
      },
    },
  ];

  if (permissions?.canManagePersonalTimes) {
    columns.push({
      name: 'timelineAlgorithm',
      label: intl.formatMessage(tableTranslations.timelineAlgorithm),
      options: {
        alignCenter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const user = users[tableMeta.rowIndex];
          return (
            <TextField
              key={`timeline-algorithm-${user.id}`}
              id={`timeline-algorithm-${user.id}`}
              onChange={(e): Promise<void> =>
                handleTimelineUpdate(
                  tableMeta.rowData,
                  e.target.value,
                  updateValue,
                )
              }
              select
              value={value}
              variant="standard"
            >
              {TIMELINE_ALGORITHMS.map((option) => (
                <MenuItem
                  key={`timeline-algorithm-option-${user.id}-${option.value}`}
                  id={`timeline-algorithm-option-${user.id}-${option.value}`}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          );
        },
      },
    });
  }

  if (manageStaff && permissions?.canManageCourseUsers) {
    columns.push({
      name: 'role',
      label: intl.formatMessage(tableTranslations.role),
      options: {
        alignCenter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const user = users[tableMeta.rowIndex];
          return (
            <TextField
              key={`role-${user.id}`}
              className="course_user_role"
              id={`role-${user.id}`}
              onChange={(e): Promise<void> =>
                handleRoleUpdate(tableMeta.rowData, e.target.value, updateValue)
              }
              select
              value={value}
              variant="standard"
            >
              {Object.keys(COURSE_USER_ROLES).map((option) => (
                <MenuItem
                  key={`role-${user.id}-${option}`}
                  id={`role-${user.id}-${option}`}
                  value={option}
                >
                  {COURSE_USER_ROLES[option]}
                </MenuItem>
              ))}
            </TextField>
          );
        },
      },
    });
  }

  if (renderRowActionComponent) {
    columns.push({
      name: 'actions',
      label: intl.formatMessage(tableTranslations.actions),
      options: {
        empty: true,
        sort: false,
        alignCenter: true,
        customBodyRender: (_value, tableMeta): JSX.Element => {
          const rowData = tableMeta.rowData as CourseUserRowData;
          const user = rebuildObjectFromRow(columns, rowData);
          return renderRowActionComponent(user);
        },
        download: false,
      },
    });
  }

  return (
    <DataTable
      columns={columns}
      data={users}
      includeRowNumber
      options={options}
      title={title}
      withMargin
    />
  );
};

export default memo(injectIntl(ManageUsersTable), (prevProps, nextProps) => {
  return equal(prevProps.users, nextProps.users);
});
