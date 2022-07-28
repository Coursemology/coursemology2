import { FC, ReactElement, memo } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { Box, Checkbox, MenuItem, TextField, Typography } from '@mui/material';
import DataTable from 'lib/components/DataTable';
import {
  CourseUserRowData,
  CourseUserMiniEntity,
  CourseUserRole,
} from 'types/course/courseUsers';
import Note from 'lib/components/Note';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import sharedConstants from 'lib/constants/sharedConstants';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import tableTranslations from 'lib/translations/table';
import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';
import equal from 'fast-deep-equal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import { toast } from 'react-toastify';
import { TimelineAlgorithm } from 'types/course/personalTimes';
import { getManageCourseUserPermissions } from '../../selectors';
import { updateUser } from '../../operations';

interface Props extends WrappedComponentProps {
  title: string;
  users: CourseUserMiniEntity[];
  manageStaff?: boolean;
  renderRowActionComponent?: (user: CourseUserRowData) => ReactElement;
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
  phantomSuccess: {
    id: 'course.user.phantom.success',
    defaultMessage:
      '{name} {isPhantom, select, ' +
      'true {is now a phantom} ' +
      'other {is no longer a phantom} ' +
      '}.',
  },
  changeRoleSuccess: {
    id: 'course.user.changeRole.success',
    defaultMessage: "Successfully changed {name}'s role to {role}.",
  },
  changeTimelineSuccess: {
    id: 'course.user.changeTimeline.success',
    defaultMessage:
      "Successfully changed {name}'s timeline algorithm to {timeline}.",
  },
  updateFailure: {
    id: 'course.user.update.fail',
    defaultMessage: 'Failed to update user. {error}',
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
    return dispatch(updateUser(rowData[1], newUser)).then(() => {
      toast.success(
        intl.formatMessage(translations.renameSuccess, {
          oldName: user.name,
          newName,
        }),
      );
    });
  };

  const handlePhantomUpdate = (rowData, newValue: boolean): Promise<void> => {
    const user = rebuildObjectFromRow(
      columns, // eslint-disable-line @typescript-eslint/no-use-before-define
      rowData,
    ) as CourseUserMiniEntity;
    const newUser = {
      ...user,
      phantom: newValue,
    };
    return dispatch(updateUser(rowData[1], newUser)).then(() => {
      toast.success(
        intl.formatMessage(translations.phantomSuccess, {
          name: user.name,
          isPhantom: newValue,
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
            role: sharedConstants.COURSE_USER_ROLES[newRole],
          }),
        );
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.updateFailure));
        throw error;
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
              sharedConstants.TIMELINE_ALGORITHMS.find(
                (timeline) => timeline.value === newTimeline,
              )?.label ?? 'Unknown',
          }),
        );
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.updateFailure));
        throw error;
      });
  };

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: 100,
    rowsPerPageOptions: [15, 30, 50, 100],
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
              value={value}
              className="course_user_name"
              updateValue={updateValue}
              variant="standard"
              onUpdate={(newName): Promise<void> =>
                handleNameUpdate(tableMeta.rowData, newName)
              }
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
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
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
        customBodyRender: (value, tableMeta, _updateValue): JSX.Element => {
          const user = users[tableMeta.rowIndex];
          return (
            <Checkbox
              id={`phantom-${user.id}`}
              key={`phantom-${user.id}`}
              className="course_user_phantom"
              checked={value}
              style={styles.checkbox}
              onChange={(event): Promise<void> =>
                handlePhantomUpdate(tableMeta.rowData, event.target.checked)
              }
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
              id={`timeline-algorithm-${user.id}`}
              key={`timeline-algorithm-${user.id}`}
              select
              value={value}
              onChange={(e): Promise<void> =>
                handleTimelineUpdate(
                  tableMeta.rowData,
                  e.target.value,
                  updateValue,
                )
              }
              variant="standard"
            >
              {sharedConstants.TIMELINE_ALGORITHMS.map((option) => (
                <MenuItem
                  id={`timeline-algorithm-option-${user.id}-${option.value}`}
                  key={`timeline-algorithm-option-${user.id}-${option.value}`}
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
              id={`role-${user.id}`}
              key={`role-${user.id}`}
              className="course_user_role"
              select
              value={value}
              onChange={(e): Promise<void> =>
                handleRoleUpdate(tableMeta.rowData, e.target.value, updateValue)
              }
              variant="standard"
            >
              {Object.keys(sharedConstants.COURSE_USER_ROLES).map((option) => (
                <MenuItem
                  id={`role-${user.id}-${option}`}
                  key={`role-${user.id}-${option}`}
                  value={option}
                >
                  {sharedConstants.COURSE_USER_ROLES[option]}
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
          const actionComponent = renderRowActionComponent(user);
          return actionComponent;
        },
      },
    });
  }

  return (
    <Box sx={{ margin: '12px 0px' }}>
      <DataTable
        title={title}
        data={users}
        columns={columns}
        options={options}
        includeRowNumber
      />
    </Box>
  );
};

export default memo(injectIntl(ManageUsersTable), (prevProps, nextProps) => {
  return equal(prevProps.users, nextProps.users);
});
