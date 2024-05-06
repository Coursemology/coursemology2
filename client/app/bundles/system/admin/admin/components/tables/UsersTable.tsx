import { FC, ReactElement, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { debounceSearchRender } from 'mui-datatables';
import {
  TableColumns,
  TableOptions,
  TableState,
} from 'types/components/DataTable';
import { AdminStats, UserMiniEntity, UserRoles } from 'types/users';

import DataTable from 'lib/components/core/layouts/DataTable';
import Link from 'lib/components/core/Link';
import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';
import {
  DEFAULT_TABLE_ROWS_PER_PAGE,
  FIELD_DEBOUNCE_DELAY_MS,
  USER_ROLES,
} from 'lib/constants/sharedConstants';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import tableTranslations from 'lib/translations/table';

import { indexUsers, updateUser } from '../../operations';

interface Props extends WrappedComponentProps {
  users: UserMiniEntity[];
  userCounts: AdminStats;
  filter: { active: boolean; role: string };
  title: string;
  renderRowActionComponent: (user: UserMiniEntity) => ReactElement;
}

const translations = defineMessages({
  searchText: {
    id: 'system.admin.admin.UsersTable.searchText',
    defaultMessage: 'Search user name or emails',
  },
  renameSuccess: {
    id: 'system.admin.admin.UsersTable.renameSuccess',
    defaultMessage: '{oldName} was renamed to {newName}.',
  },
  changeRoleSuccess: {
    id: 'system.admin.admin.UsersTable.changeRoleSuccess',
    defaultMessage: "Successfully changed {name}'s role to {role}.",
  },
  updateNameFailure: {
    id: 'system.admin.admin.UsersTable.updateNameFailure',
    defaultMessage: "Failed to update user's name.",
  },
  updateRoleFailure: {
    id: 'system.admin.admin.UsersTable.updateRoleFailure',
    defaultMessage: "Failed to update user's role.",
  },
  fetchFilteredUsersFailure: {
    id: 'system.admin.users.UsersTable.fetchFilteredUsersFailure',
    defaultMessage: 'Failed to fetch users.',
  },
});

const UsersTable: FC<Props> = (props) => {
  const { title, renderRowActionComponent, intl, filter, users, userCounts } =
    props;
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const [tableState, setTableState] = useState<TableState>({
    count: userCounts.usersCount,
    page: 1,
    searchText: '',
  });

  const handleNameUpdate = (rowData, newName: string): Promise<void> => {
    const user = rebuildObjectFromRow(
      columns, // eslint-disable-line @typescript-eslint/no-use-before-define
      rowData,
    ) as UserMiniEntity;
    const newUser = {
      ...user,
      name: newName,
    };
    return dispatch(updateUser(user.id, newUser))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.renameSuccess, {
            oldName: user.name,
            newName,
          }),
        );
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.updateNameFailure));
        throw error;
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
    ) as UserMiniEntity;
    const newUser = {
      ...user,
      role: newRole as UserRoles,
    };
    return dispatch(updateUser(user.id, newUser))
      .then(() => {
        updateValue(newRole);
        toast.success(
          intl.formatMessage(translations.changeRoleSuccess, {
            name: user.name,
            role: USER_ROLES[newRole],
          }),
        );
      })
      .catch(() => {
        toast.error(intl.formatMessage(translations.updateRoleFailure));
      });
  };

  const changePage = (page: number): void => {
    setIsLoading(true);
    setTableState({
      ...tableState,
      page,
    });
    dispatch(
      indexUsers({
        'filter[page_num]': page,
        'filter[length]': DEFAULT_TABLE_ROWS_PER_PAGE,
        role: filter.role,
        active: filter.active,
      }),
    )
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchFilteredUsersFailure)),
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  const search = (page: number, searchText?: string): void => {
    setIsLoading(true);
    setTableState({
      ...tableState,
      count: userCounts.usersCount,
    });
    dispatch(
      indexUsers({
        'filter[page_num]': page,
        'filter[length]': DEFAULT_TABLE_ROWS_PER_PAGE,
        role: filter.role,
        active: filter.active,
        search: searchText ? searchText.trim() : searchText,
      }),
    )
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchFilteredUsersFailure)),
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  const options: TableOptions = {
    count: tableState.count,
    customSearchRender: debounceSearchRender(FIELD_DEBOUNCE_DELAY_MS),
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
    setRowProps: (_row, _dataIndex, rowIndex): Record<string, unknown> => {
      return {
        key: `user_${users[rowIndex].id}`,
        userid: `user_${users[rowIndex].id}`,
        className: `system_user system_user_${users[rowIndex].id}`,
      };
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
      name: 'name',
      label: intl.formatMessage(tableTranslations.name),
      options: {
        alignCenter: false,
        sort: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const userId = tableMeta.rowData[0];
          return (
            <InlineEditTextField
              key={`name-${userId}`}
              className="user_name"
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
        sort: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
        sort: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const user = users[dataIndex];
          return (
            <ul className="mb-0 pl-0">
              {user.instances.map((instance) => (
                <li key={instance.name} className="list-none">
                  <Link
                    href={`//${instance.host}/admin/users`}
                    underline="hover"
                  >
                    {instance.name}
                  </Link>
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
        sort: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const userId = tableMeta.rowData[0];
          return (
            <TextField
              key={`role-${userId}`}
              className="user_role"
              id={`role-${userId}`}
              onChange={(e): Promise<void> =>
                handleRoleUpdate(tableMeta.rowData, e.target.value, updateValue)
              }
              select
              value={value}
              variant="standard"
            >
              {Object.keys(USER_ROLES).map((option) => (
                <MenuItem
                  key={`role-${userId}-${option}`}
                  id={`role-${userId}-${option}`}
                  value={option}
                >
                  {USER_ROLES[option]}
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
          const rowData = tableMeta.rowData;
          const user = rebuildObjectFromRow(columns, rowData);
          return renderRowActionComponent(user as UserMiniEntity);
        },
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
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

export default injectIntl(UsersTable);
