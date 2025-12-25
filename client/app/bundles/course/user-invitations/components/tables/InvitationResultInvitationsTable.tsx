import { FC, memo } from 'react';
import { Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { InvitationListData } from 'types/course/userInvitations';

import DataTable from 'lib/components/core/layouts/DataTable';
import {
  COURSE_USER_ROLES,
  DEFAULT_TABLE_ROWS_PER_PAGE,
} from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

interface Props {
  title: JSX.Element;
  invitations: InvitationListData[];
}

const InvitationResultInvitationsTable: FC<Props> = (props) => {
  const { title, invitations } = props;
  const { t } = useTranslation();

  if (invitations && invitations.length === 0) return null;

  const options: TableOptions = {
    download: true,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: DEFAULT_TABLE_ROWS_PER_PAGE,
    rowsPerPageOptions: [DEFAULT_TABLE_ROWS_PER_PAGE],
    search: false,
    selectableRows: 'none',
    setTableProps: (): object => {
      return { size: 'small' };
    },
    setRowProps: (_row, dataIndex, _rowIndex): Record<string, unknown> => {
      return {
        key: `invitation_result_invitation_${invitations[dataIndex].id}`,
        invitationid: `invitation_result_invitation_${invitations[dataIndex].id}`,
        className: `invitation_result_invitation invitation_result_invitation_${invitations[dataIndex].id}`,
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
          const invitation = invitations[dataIndex];
          return (
            <Typography
              key={`phantom-${invitation.id}`}
              className="invitation_result_invitation_phantom"
              variant="body2"
            >
              {invitation.phantom ? 'Yes' : 'No'}
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
          const invitation = invitations[dataIndex];
          return (
            <Typography
              key={`role-${invitation.id}`}
              className="invitation_result_invitation_role"
              variant="body2"
            >
              {COURSE_USER_ROLES[invitation.role]}
            </Typography>
          );
        },
      },
    },
    {
      name: 'sentAt',
      label: t(tableTranslations.invitationSentAt),
      options: {
        alignCenter: false,
        sort: false,
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={invitations}
      includeRowNumber
      options={options}
      title={title}
      withMargin
    />
  );
};

export default memo(
  InvitationResultInvitationsTable,
  (prevProps, nextProps) => {
    return equal(prevProps.invitations, nextProps.invitations);
  },
);
