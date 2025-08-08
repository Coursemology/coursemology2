import { FC, ReactElement, useState } from 'react';
import { defineMessages } from 'react-intl';
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
import {
  InstanceAdminStats,
  InstanceUserMiniEntity,
  InstanceUserRoles,
} from 'types/system/instance/users';

import DataTable from 'lib/components/core/layouts/DataTable';
import Link from 'lib/components/core/Link';
import {
  DEFAULT_TABLE_ROWS_PER_PAGE,
  FIELD_DEBOUNCE_DELAY_MS,
  INSTANCE_USER_ROLES,
} from 'lib/constants/sharedConstants';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import tableTranslations from 'lib/translations/table';

import { indexUsers, updateUser } from '../../operations';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  users: InstanceUserMiniEntity[];
  userCounts: InstanceAdminStats;
  title: string;
  filter: { active: boolean; role: string };
  renderRowActionComponent: (user: InstanceUserMiniEntity) => ReactElement;
}

const translations = defineMessages({
  searchText: {
    id: 'system.admin.instance.instance.UsersTable.searchPlaceholder',
    defaultMessage: 'Search user name or emails',
  },
  renameSuccess: {
    id: 'system.admin.instance.instance.UsersTable.renameSuccess',
    defaultMessage: '{oldName} was renamed to {newName}.',
  },
  changeRoleSuccess: {
    id: 'system.admin.instance.instance.UsersTable.changeRoleSuccess',
    defaultMessage: "Successfully changed {name}'s role to {role}.",
  },
  updateNameFailure: {
    id: 'system.admin.instance.instance.UsersTable.update.updateNameFailure',
    defaultMessage: "Failed to update user's name.",
  },
  updateRoleFailure: {
    id: 'system.admin.instance.instance.UsersTable.update.updateRoleFailure',
    defaultMessage: "Failed to update user's role.",
  },
  fetchFilteredUsersFailure: {
    id: 'system.admin.instance.instance.UsersTables.fetchFilteredUsersFailure',
    defaultMessage: 'Failed to fetch users.',
  },
});

const UsersTable: FC<Props> = (props) => {
  const { title, renderRowActionComponent, users, userCounts, filter } =
    props;
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [tableState, setTableState] = useState<TableState>({
    count: userCounts.usersCount,
    page: 1,
    searchText: '',
  });

  const handleRoleUpdate = (
    rowData,
    newRole: string,
    updateValue,
  ): Promise<void> => {
    const user = rebuildObjectFromRow(
      columns, // eslint-disable-line @typescript-eslint/no-use-before-define
      rowData,
    ) as InstanceUserMiniEntity;
    const newUser = {
      ...user,
      role: newRole as InstanceUserRoles,
    };
    return dispatch(updateUser(user.id, newUser))
      .then(() => {
        updateValue(newRole);
        toast.success(
          t(translations.changeRoleSuccess, {
            name: user.name,
            role: INSTANCE_USER_ROLES[newRole],
          }),
        );
      })
      .catch(() => {
        toast.error(t(translations.updateRoleFailure));
      });
  };

  const changePage = (page): void => {
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
        toast.error(t(translations.fetchFilteredUsersFailure)),
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
        toast.error(t(translations.fetchFilteredUsersFailure)),
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
    searchPlaceholder: t(translations.searchText),
    selectableRows: 'none',
    serverSide: true,
    setTableProps: (): Record<string, unknown> => {
      return { size: 'small' };
    },
    setRowProps: (_row, _dataIndex, rowIndex): Record<string, unknown> => {
      return {
        key: `user_${users[rowIndex].id}`,
        userid: `user_${users[rowIndex].id}`,
        className: `instance_user instance_user_${users[rowIndex].id}`,
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
      name: 'userId',
      label: '',
      options: {
        display: false,
        filter: false,
        sort: false,
      },
    },
    {
      name: 'name',
      label: t(tableTranslations.name),
      options: {
        alignCenter: false,
        sort: false,
      },
    },
    {
      name: 'email',
      label: t(tableTranslations.email),
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
      name: 'courses',
      label: t(tableTranslations.relatedCourses),
      options: {
        alignCenter: false,
        sort: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const user = users[dataIndex];
          return (
            <Link
              key={`courses-${user.id}`}
              className="user_courses"
              opensInNewTab
              to={`/users/${user.userId}`}
              underline="hover"
            >
              {user.courses}
            </Link>
          );
        },
      },
    },
    {
      name: 'role',
      label: t(tableTranslations.role),
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
              {Object.keys(INSTANCE_USER_ROLES).map((option) => (
                <MenuItem
                  key={`role-${userId}-${option}`}
                  id={`role-${userId}-${option}`}
                  value={option}
                >
                  {INSTANCE_USER_ROLES[option]}
                </MenuItem>
              ))}
            </TextField>
          );
        },
      },
    },
    {
      name: 'actions',
      label: t(tableTranslations.actions),
      options: {
        empty: true,
        sort: false,
        alignCenter: true,
        customBodyRender: (_value, tableMeta): JSX.Element => {
          const rowData = tableMeta.rowData;
          const user = rebuildObjectFromRow(columns, rowData);
          return renderRowActionComponent(user as InstanceUserMiniEntity);
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

export default UsersTable;
