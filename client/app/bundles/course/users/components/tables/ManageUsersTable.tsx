import { FC } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Checkbox, MenuItem, TextField, Typography } from '@mui/material';
import DataTable from 'lib/components/DataTable';
import {
  CourseUserEntity,
  CourseUsersPermissions,
} from 'types/course/course_users';
import Note from 'lib/components/Note';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import UserManagementButtons from '../buttons/UserManagementButtons';
import sharedConstants from 'lib/constants/sharedConstants';

interface Props {
  title: string;
  users: CourseUserEntity[];
  permissions: CourseUsersPermissions | null;
  showRoleColumn?: boolean;
}

const translations = defineMessages({
  noUsers: {
    id: 'course.users.components.tables.ManageUsersTable.noUsers',
    defaultMessage: 'There are no users',
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
  const { title, users, permissions, showRoleColumn = false } = props;

  if (users && users.length === 0) {
    return <Note message={<FormattedMessage {...translations.noUsers} />} />;
  }

  const options = {
    download: false,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: 30,
    rowsPerPageOptions: [15, 30, 50],
    search: true,
    selectableRows: 'none',
    setRowProps: (
      _row: Array<any>,
      dataIndex: number,
      _rowIndex: number,
    ): Record<string, unknown> => {
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

  const columns: any = [
    {
      name: 'id',
      label: 'id',
      options: {
        display: false,
        filter: false,
        sort: false,
      },
    },
    {
      name: 'name',
      label: 'Name',
      options: {
        alignCenter: false,
        customBodyRender: (value, _tableMeta, updateValue): JSX.Element => {
          return (
            <TextField
              value={value}
              onChange={(event) => updateValue(event.target.value)}
              style={styles.textField}
              variant="standard"
            />
          );
        },
      },
    },
    {
      name: 'email',
      label: 'Email',
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
      label: 'Phantom',
      options: {
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const user = tableMeta.tableData[tableMeta.rowIndex];
          return (
            <Checkbox
              id={`checkbox_${user.id}`}
              key={`checkbox_${user.id}`}
              checked={value}
              style={styles.checkbox}
              onChange={(e) => updateValue(e.target.checked)}
            />
          );
        },
      },
    },
  ];

  if (permissions?.canManagePersonalTimes) {
    columns.push({
      name: 'timelineAlgorithm',
      label: 'Timeline Algorithm',
      options: {
        alignCenter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const user = tableMeta.tableData[tableMeta.rowIndex];
          return (
            <TextField
              id={`timeline-algorithm-${user.id}`}
              select
              value={value}
              onChange={(e) => updateValue(e.target.value)}
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

  if (showRoleColumn && permissions?.canManageCourseUsers) {
    columns.push({
      name: 'role',
      label: 'Role',
      options: {
        alignCenter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const user = tableMeta.tableData[tableMeta.rowIndex];
          return (
            <TextField
              id={`role-${user.id}`}
              select
              value={value}
              onChange={(e) => updateValue(e.target.value)}
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

  columns.push({
    name: 'actions',
    label: 'Actions',
    options: {
      empty: true,
      sort: false,
      alignCenter: true,
      customBodyRender: (_value, tableMeta): JSX.Element => {
        const rowData = tableMeta.currentTableData[tableMeta.rowIndex];
        const user = rebuildObjectFromRow(columns, rowData); // maybe can optimize if we push this function to within the buttons?
        return <UserManagementButtons user={user} />;
      },
    },
  });

  return (
    <DataTable
      title={title}
      data={users}
      columns={columns}
      options={options}
      includeRowNumber
    />
  );
};

export default ManageUsersTable;
