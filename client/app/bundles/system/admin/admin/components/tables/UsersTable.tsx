import { FC, ReactElement, useState } from 'react';
import {
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  TableColumns,
  TableOptions,
  TableState,
} from 'types/components/DataTable';
import { AdminStats, UserMiniEntity, UserRole } from 'types/users';
import tableTranslations from 'lib/translations/table';
import {
  USER_ROLES,
  FIELD_DEBOUNCE_DELAY,
  TABLE_ROWS_PER_PAGE,
} from 'lib/constants/sharedConstants';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import { debounceSearchRender } from 'mui-datatables';
import DataTable from 'lib/components/core/layouts/DataTable';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
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
    id: 'system.admin.components.tables.UsersTable.searchPlaceholder',
    defaultMessage: 'Search user name or emails',
  },
  renameSuccess: {
    id: 'system.admin.user.rename.success',
    defaultMessage: '{oldName} was renamed to {newName}.',
  },
  changeRoleSuccess: {
    id: 'system.admin.user.changeRole.success',
    defaultMessage: "Successfully changed {name}'s role to {role}.",
  },
  updateNameFailure: {
    id: 'system.admin.user.update.updateNameFailure',
    defaultMessage: "Failed to update user's name.",
  },
  updateRoleFailure: {
    id: 'system.admin.user.update.updateRoleFailure',
    defaultMessage: "Failed to update user's role.",
  },
  fetchFilteredUsersFailure: {
    id: 'system.admin.users.fetchFiltered.failure',
    defaultMessage: 'Failed to fetch users.',
  },
});

const UsersTable: FC<Props> = (props) => {
  const { title, renderRowActionComponent, intl, filter, users, userCounts } =
    props;
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

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
      role: newRole as UserRole,
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
        'filter[length]': TABLE_ROWS_PER_PAGE,
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
        'filter[length]': TABLE_ROWS_PER_PAGE,
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
    rowsPerPage: TABLE_ROWS_PER_PAGE,
    rowsPerPageOptions: [TABLE_ROWS_PER_PAGE],
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
        sort: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
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
        sort: false,
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
        sort: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const user = users[dataIndex];
          return (
            <ul className="mb-0 pl-0">
              {user.instances.map((instance) => (
                <li key={instance.name} className="list-none">
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
        sort: false,
        customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
          const userId = tableMeta.rowData[0];
          return (
            <TextField
              id={`role-${userId}`}
              key={`role-${userId}`}
              className="user_role"
              select
              value={value}
              onChange={(e): Promise<void> =>
                handleRoleUpdate(tableMeta.rowData, e.target.value, updateValue)
              }
              variant="standard"
            >
              {Object.keys(USER_ROLES).map((option) => (
                <MenuItem
                  id={`role-${userId}-${option}`}
                  key={`role-${userId}-${option}`}
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
          const rowData = tableMeta.rowData as UserMiniEntity;
          const user = rebuildObjectFromRow(columns, rowData);
          const actionComponent = renderRowActionComponent(user);
          return actionComponent;
        },
      },
    },
  ];

  return (
    <DataTable
      title={
        <Typography variant="h6">
          {title}
          {isLoading && (
            <CircularProgress className="relative top-1 ml-4" size={24} />
          )}
        </Typography>
      }
      data={users}
      columns={columns}
      options={options}
      isLoading={isLoading}
      withMargin
    />
  );
};

export default injectIntl(UsersTable);
