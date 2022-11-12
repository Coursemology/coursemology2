import { FC, memo } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { CourseUserData } from 'types/course/courseUsers';

import DataTable from 'lib/components/core/layouts/DataTable';
import {
  COURSE_USER_ROLES,
  TABLE_ROWS_PER_PAGE,
} from 'lib/constants/sharedConstants';
import tableTranslations from 'lib/translations/table';

interface Props extends WrappedComponentProps {
  title: JSX.Element;
  users: CourseUserData[];
}

const InvitationResultUsersTable: FC<Props> = (props) => {
  const { title, users, intl } = props;

  if (users && users.length === 0) return null;

  const options: TableOptions = {
    download: true,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: TABLE_ROWS_PER_PAGE,
    rowsPerPageOptions: [TABLE_ROWS_PER_PAGE],
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
      name: 'phantom',
      label: intl.formatMessage(tableTranslations.phantom),
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
      label: intl.formatMessage(tableTranslations.role),
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
      includeRowNumber={true}
      options={options}
      title={title}
      withMargin={true}
    />
  );
};

export default memo(
  injectIntl(InvitationResultUsersTable),
  (prevProps, nextProps) => {
    return equal(prevProps.users, nextProps.users);
  },
);
