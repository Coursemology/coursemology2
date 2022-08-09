import { FC, memo } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Box, Typography } from '@mui/material';
import DataTable from 'lib/components/DataTable';
import { InstanceUserListData } from 'types/system/instance/users';
import sharedConstants from 'lib/constants/sharedConstants';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import tableTranslations from 'lib/translations/table';
import equal from 'fast-deep-equal';

interface Props extends WrappedComponentProps {
  title: JSX.Element;
  users: InstanceUserListData[];
}

const InvitationResultUsersTable: FC<Props> = (props) => {
  const { title, users, intl } = props;

  if (users && users.length === 0) {
    return <></>;
  }

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
        sort: false,
      },
    },
    {
      name: 'email',
      label: intl.formatMessage(tableTranslations.email),
      options: {
        alignCenter: false,
        sort: false,
      },
    },
    {
      name: 'role',
      label: intl.formatMessage(tableTranslations.role),
      options: {
        alignCenter: false,
        sort: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const user = users[dataIndex];
          return (
            <Typography
              key={`role-${user.id}`}
              className="invitation_result_user_role"
              variant="body2"
            >
              {sharedConstants.INSTANCE_USER_ROLES[user.role]}
            </Typography>
          );
        },
      },
    },
  ];

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

export default memo(
  injectIntl(InvitationResultUsersTable),
  (prevProps, nextProps) => {
    return equal(prevProps.users, nextProps.users);
  },
);
