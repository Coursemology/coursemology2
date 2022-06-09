import { FC, ReactElement } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { Box, Checkbox, MenuItem, TextField, Typography } from '@mui/material';
import DataTable from 'lib/components/DataTable';
import {
  CourseUserEntity,
  ManageCourseUsersPermissions,
} from 'types/course/courseUsers';
import Note from 'lib/components/Note';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import sharedConstants from 'lib/constants/sharedConstants';
import { InvitationEntity } from 'types/course/userInvitations';
import { TableColumns, TableOptions } from 'types/components/DataTable';

interface Props extends WrappedComponentProps {
  title: string;
  users: CourseUserEntity[] | InvitationEntity[];
  permissions: ManageCourseUsersPermissions | null;
  manageStaff?: boolean;
  // pendingInvitations?: boolean;
  // acceptedInvitations?: boolean;
  renderRowActionComponent?: (any) => ReactElement;
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
  idColumn: {
    id: 'course.users.components.tables.ManageUsersTable.column.id',
    defaultMessage: 'id',
  },
  nameColumn: {
    id: 'course.users.components.tables.ManageUsersTable.column.name',
    defaultMessage: 'Name',
  },
  emailColumn: {
    id: 'course.users.components.tables.ManageUsersTable.column.email',
    defaultMessage: 'Email',
  },
  phantomColumn: {
    id: 'course.users.components.tables.ManageUsersTable.column.phantom',
    defaultMessage: 'Phantom',
  },
  roleColumn: {
    id: 'course.users.components.tables.ManageUsersTable.column.role',
    defaultMessage: 'Role',
  },
  timelineAlgorithmColumn: {
    id: 'course.users.components.tables.ManageUsersTable.column.timelineAlgorithm',
    defaultMessage: 'Timeline Algorithm',
  },
  actionsColumn: {
    id: 'course.users.components.tables.ManageUsersTable.column.actions',
    defaultMessage: 'Actions',
  },
});

const styles = {
  badge: {
    maxHeight: 75,
    maxWidth: 75,
  },
  checkbox: {
    margin: '0px 12px 0px 0px',
    padding: 0,
  },
  textField: {
    width: '100%',
    marginBottom: '0.5rem',
  },
};

const ManageUsersTable: FC<Props> = (props) => {
  const {
    title,
    users,
    permissions,
    manageStaff = false,
    renderRowActionComponent = null,
    intl,
  } = props;

  if (users && users.length === 0) {
    return <Note message={<FormattedMessage {...translations.noUsers} />} />;
  }

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
    setRowProps: (_row, dataIndex, _rowIndex): Record<string, unknown> => {
      return {
        userid: `user_${users[dataIndex].id}`,
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
      label: intl.formatMessage(translations.idColumn),
      options: {
        display: false,
        filter: false,
        sort: false,
      },
    },
    {
      name: 'name',
      label: intl.formatMessage(translations.nameColumn),
      options: {
        alignCenter: false,
        customBodyRender: (value, _tableMeta, updateValue): JSX.Element => {
          return (
            <TextField
              value={value}
              onChange={(event): void => updateValue(event.target.value)}
              style={styles.textField}
              variant="standard"
            />
          );
        },
      },
    },
    {
      name: 'email',
      label: intl.formatMessage(translations.emailColumn),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const user = users[dataIndex];
          return (
            <Typography key={user.id} variant="body2">
              {user.email}
            </Typography>
          );
        },
      },
    },
    {
      name: 'phantom',
      label: intl.formatMessage(translations.phantomColumn),
      options: {
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const user = tableMeta.tableData[tableMeta.rowIndex];
          return (
            <Checkbox
              id={`checkbox_${user.id}`}
              key={`checkbox_${user.id}`}
              checked={value}
              style={styles.checkbox}
              onChange={(e): void => updateValue(e.target.checked)}
            />
          );
        },
      },
    },
  ];

  if (permissions?.canManagePersonalTimes) {
    columns.push({
      name: 'timelineAlgorithm',
      label: intl.formatMessage(translations.timelineAlgorithmColumn),
      options: {
        alignCenter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const user = tableMeta.tableData[tableMeta.rowIndex];
          return (
            <TextField
              id={`timeline-algorithm-${user.id}`}
              select
              value={value}
              onChange={(e): void => updateValue(e.target.value)}
              variant="standard"
            >
              {sharedConstants.TIMELINE_ALGORITHMS.map((option) => (
                <MenuItem
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
      label: intl.formatMessage(translations.roleColumn),
      options: {
        alignCenter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const user = tableMeta.tableData[tableMeta.rowIndex];
          return (
            <TextField
              id={`role-${user.id}`}
              select
              value={value}
              onChange={(e): void => updateValue(e.target.value)}
              variant="standard"
            >
              {sharedConstants.USER_ROLES.map((option) => (
                <MenuItem
                  key={`role-${user.id}-${option.value}`}
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

  if (renderRowActionComponent) {
    columns.push({
      name: 'actions',
      label: intl.formatMessage(translations.actionsColumn),
      options: {
        empty: true,
        sort: false,
        alignCenter: true,
        customBodyRender: (_value, tableMeta): JSX.Element => {
          const rowData = tableMeta.currentTableData[tableMeta.rowIndex];
          const user = rebuildObjectFromRow(columns, rowData); // maybe can optimize if we push this function to within the buttons?
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

export default injectIntl(ManageUsersTable);
