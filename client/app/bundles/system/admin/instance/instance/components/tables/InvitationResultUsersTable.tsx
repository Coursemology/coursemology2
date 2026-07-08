import { FC } from 'react';
import { Typography } from '@mui/material';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { InstanceUserListData } from 'types/system/instance/users';

import DataTable from 'lib/components/core/layouts/DataTable';
import useTranslation from 'lib/hooks/useTranslation';
import instanceRoleTranslations from 'lib/translations/instance/users/roles';
import tableTranslations from 'lib/translations/table';

interface Props {
  title: JSX.Element;
  users: InstanceUserListData[];
}

const InvitationResultUsersTable: FC<Props> = (props) => {
  const { title, users } = props;
  const { t } = useTranslation();

  const options: TableOptions = {
    download: true,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: 15,
    rowsPerPageOptions: [15],
    search: false,
    selectableRows: 'none',
    setTableProps: (): object => {
      return { size: 'small' };
    },
    setRowProps: (_row, dataIndex, _rowIndex): Record<string, unknown> => {
      return {
        key: `invitation_result_user_${users[dataIndex].id}`,
        userid: `invitation_result_user_${users[dataIndex].id}`,
        className: `invitation_result_user invitation_result_user_${users[dataIndex].id}`,
      };
    },
    viewColumns: false,
  };

  const columns: TableColumns[] = [
    {
      name: 'id',
      label: t(tableTranslations.id),
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
      },
    },
    {
      name: 'role',
      label: t(tableTranslations.role),
      options: {
        alignCenter: false,
        sort: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const user = users[dataIndex];
          return (
            <Typography
              key={`role-${user.id}`}
              className="invitation_result_user_role"
              variant="body2"
            >
              {t(instanceRoleTranslations[user.role])}
            </Typography>
          );
        },
      },
    },
  ];

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

export default InvitationResultUsersTable;
