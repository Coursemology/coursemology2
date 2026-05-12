import { FC } from 'react';
import { Typography } from '@mui/material';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { InvitationListData } from 'types/system/instance/invitations';

import DataTable from 'lib/components/core/layouts/DataTable';
import useTranslation from 'lib/hooks/useTranslation';
import instanceRoleTranslations from 'lib/translations/instance/users/roles';
import tableTranslations from 'lib/translations/table';

interface Props {
  title: JSX.Element;
  invitations: InvitationListData[];
}

const InvitationResultInvitationsTable: FC<Props> = (props) => {
  const { title, invitations } = props;
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
              {t(instanceRoleTranslations[invitation.role])}
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

export default InvitationResultInvitationsTable;
