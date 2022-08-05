import { FC, ReactElement, useEffect, useState } from 'react';
import {
  Box,
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
import { UserMiniEntity, UserRole } from 'types/users';
import tableTranslations from 'lib/translations/table';
import sharedConstants, {
  FIELD_DEBOUNCE_DELAY,
} from 'lib/constants/sharedConstants';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import { debounceSearchRender } from 'mui-datatables';
import DataTable from 'lib/components/DataTable';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import { getUrlParameter } from 'lib/helpers/url-helpers';
import LoadingOverlay from 'lib/components/LoadingOverlay';
import { indexUsers, updateUser } from '../../operations';
import { getAdminCounts, getAllUserMiniEntities } from '../../selectors';

interface Props extends WrappedComponentProps {
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
  const { title, renderRowActionComponent, intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const users = useSelector((state: AppState) => getAllUserMiniEntities(state));
  const counts = useSelector((state: AppState) => getAdminCounts(state));
  const role = getUrlParameter('role');
  const active = getUrlParameter('active');
  const dispatch = useDispatch<AppDispatch>();

  const [tableState, setTableState] = useState<TableState>({
    count: counts.usersCount,
    page: 1,
    searchText: '',
  });

  useEffect((): void => {
    setTableState({
      ...tableState,
      count: counts.usersCount,
    });
  }, [counts]);

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
            role: sharedConstants.USER_ROLES[newRole],
          }),
        );
      })
      .catch(() => {
        toast.error(intl.formatMessage(translations.updateRoleFailure));
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
        'filter[length]': 100,
        role,
        active,
      }),
    )
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchFilteredUsersFailure)),
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  const search = (page, searchText): void => {
    if (searchText !== null) {
      setIsLoading(true);
      setTableState({
        ...tableState,
        count: counts.usersCount,
      });
      dispatch(
        indexUsers({
          'filter[page_num]': page,
          'filter[length]': 100,
          role,
          active,
          search: searchText ? searchText.trim() : searchText,
        }),
      )
        .catch(() =>
          toast.error(
            intl.formatMessage(translations.fetchFilteredUsersFailure),
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
        data={users}
        columns={columns}
        options={options}
      />
    </Box>
  );
};

export default injectIntl(UsersTable);
