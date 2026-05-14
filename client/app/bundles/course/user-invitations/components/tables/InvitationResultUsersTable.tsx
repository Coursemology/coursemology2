import { FC, memo } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { CourseUserListData } from 'types/course/courseUsers';
import { DuplicateReason } from 'types/course/userInvitations';

import DataTable from 'lib/components/core/layouts/DataTable';
import useTranslation from 'lib/hooks/useTranslation';
import roleTranslations from 'lib/translations/course/users/roles';
import tableTranslations from 'lib/translations/table';

const translations = defineMessages({
  duplicateEmail: {
    id: 'course.userInvitations.InvitationResultUsersTable.duplicateEmail',
    defaultMessage: 'Duplicate email',
  },
  duplicateExternalId: {
    id: 'course.userInvitations.InvitationResultUsersTable.duplicateExternalId',
    defaultMessage: 'Duplicate external ID',
  },
});

interface Props {
  title: JSX.Element;
  users: Array<CourseUserListData & { reason?: DuplicateReason }>;
}

const InvitationResultUsersTable: FC<Props> = (props) => {
  const { title, users } = props;
  const { t } = useTranslation();

  if (users && users.length === 0) return null;

  const showExternalId = users.some((u) => u.externalId != null);
  const showReason = users.some((u) => u.reason != null);

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
    ...(showExternalId
      ? [
          {
            name: 'externalId',
            label: t(tableTranslations.externalId),
            options: {
              alignCenter: true,
              sort: false,
            },
          },
        ]
      : []),
    ...(showReason
      ? [
          {
            name: 'reason',
            label: t(tableTranslations.reason),
            options: {
              alignCenter: false,
              sort: false,
              customBodyRenderLite: (dataIndex: number): JSX.Element => {
                const user = users[dataIndex];
                return (
                  <Typography
                    key={`reason-${user.id}`}
                    className="invitation_result_user_reason"
                    variant="body2"
                  >
                    {user.reason === 'duplicate_external_id'
                      ? t(translations.duplicateExternalId)
                      : t(translations.duplicateEmail)}
                  </Typography>
                );
              },
            },
          },
        ]
      : []),
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
              {t(roleTranslations[user.role])}
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

export default memo(InvitationResultUsersTable, (prevProps, nextProps) => {
  return equal(prevProps.users, nextProps.users);
});
