import { FC, memo } from 'react';
import { Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { CourseUserData } from 'types/course/courseUsers';

import DataTable from 'lib/components/core/layouts/DataTable';
import { COURSE_USER_ROLES } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

interface Props {
  title: JSX.Element;
  users: CourseUserData[];
}

const InvitationResultUsersTable: FC<Props> = (props) => {
  const { title, users } = props;
  const { t } = useTranslation();

  if (users && users.length === 0) return null;

  const options: TableOptions = {
    download: true,
    filter: false,
    pagination: false,
    print: false,
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
      name: 'phantom',
      label: t(tableTranslations.phantom),
      options: {
        sort: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const user = users[dataIndex];
          return (
            <Typography
              key={`phantom-${user.id}`}
              className="invitation_result_user_phantom"
              variant="body2"
            >
              {user.phantom ? 'Yes' : 'No'}
            </Typography>
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const user = users[dataIndex];
          return (
            <Typography
              key={`role-${user.id}`}
              className="invitation_result_user_role"
              variant="body2"
            >
              {COURSE_USER_ROLES[user.role]}
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

export default memo(
  InvitationResultUsersTable,
  (prevProps, nextProps) => {
    return equal(prevProps.users, nextProps.users);
  },
);
