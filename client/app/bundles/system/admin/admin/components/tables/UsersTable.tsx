import { FC, ReactElement, memo } from 'react';
import { Box, MenuItem, TextField, Typography } from '@mui/material';
import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { UserMiniEntity } from 'types/users';
import tableTranslations from 'lib/components/tables/translations';
import sharedConstants from 'lib/constants/sharedConstants';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import equal from 'fast-deep-equal';
import DataTable from 'lib/components/DataTable';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { updateUser } from '../../operations';

interface Props extends WrappedComponentProps {
  users: UserMiniEntity[];
  renderRowActionComponent: (user: UserMiniEntity) => ReactElement;
}

const translations = defineMessages({
  searchText: {
    id: 'system.admin.components.tables.UsersTable.searchPlaceholder',
    defaultMessage: 'Search user name or emails',
  },
  renameSuccess: {
    id: 'system.admin.user.rename.success',
    defaultMessage: '{oldName} was renamed to {newName}.',
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

const UsersTable: FC<Props> = (props) => {
  const { users, renderRowActionComponent, intl } = props;
  const dispatch = useDispatch<AppDispatch>();

  const handleNameUpdate = (rowData, newName: string): Promise<void> => {
    const user = rebuildObjectFromRow(
      columns, // eslint-disable-line @typescript-eslint/no-use-before-define
      rowData,
    ) as UserMiniEntity;
    const newUser = {
      ...user,
      name: newName,
    };
    return dispatch(updateUser(user.id, newUser)).then(() => {
      toast.success(
        intl.formatMessage(translations.renameSuccess, {
          oldName: user.name,
          newName,
        }),
      );
    });
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
        key: `user_${users[dataIndex].id}`,
        userid: `user_${users[dataIndex].id}`,
        className: `system_user system_user_${users[dataIndex].id}`,
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
      label: '',
      options: {
        display: false,
        filter: false,
        sort: false,
      },
    },
    {
      name: 'masqueradePath',
      label: '',
      options: {
        display: false,
        filter: false,
        sort: false,
      },
    },
    {
      name: 'canMasquerade',
      label: '',
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
          console.log('rowdata', tableMeta.rowData);
          const userId = tableMeta.rowData[0];
          return (
            <InlineEditTextField
              key={`name-${userId}`}
              value={value}
              className="user_name"
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
              className="user_email"
              variant="body2"
            >
              {user.email}
            </Typography>
          );
        },
      },
    },
    {
      name: 'instances',
      label: intl.formatMessage(tableTranslations.instances),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const user = users[dataIndex];
          return (
            <ul style={styles.list}>
              {user.instances.map((instance) => (
                <li key={instance.name} style={styles.listItem}>
                  <a href={`//${instance.host}/admin/users`}>{instance.name}</a>
                </li>
              ))}
            </ul>
          );
        },
      },
    },
    {
      name: 'role',
      label: intl.formatMessage(tableTranslations.role),
      options: {
        alignCenter: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const userId = tableMeta.rowData[0];
          return (
            <TextField
              id={`role-${userId}`}
              key={`role-${userId}`}
              className="user_role"
              select
              value={value}
              onChange={(e): React.ChangeEvent => updateValue(e.target.value)}
              variant="standard"
            >
              {Object.keys(sharedConstants.USER_ROLES).map((option) => (
                <MenuItem
                  id={`role-${userId}-${option}`}
                  key={`role-${userId}-${option}`}
                  value={option}
                >
                  {sharedConstants.USER_ROLES[option]}
                </MenuItem>
              ))}
            </TextField>
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
          const rowData = tableMeta.rowData as UserMiniEntity;
          const user = rebuildObjectFromRow(columns, rowData);
          const actionComponent = renderRowActionComponent(user);
          return actionComponent;
        },
      },
    },
  ];

  return (
    <Box sx={{ margin: '12px 0px' }}>
      <DataTable
        title="Users"
        data={users}
        columns={columns}
        options={options}
      />
    </Box>
  );
};

export default memo(injectIntl(UsersTable), (prevProps, nextProps) => {
  return equal(prevProps.users, nextProps.users);
});
