import { FC } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Typography } from '@mui/material';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { InvitationListData } from 'types/system/instance/invitations';

import DataTable from 'lib/components/core/layouts/DataTable';
import { INSTANCE_USER_ROLES } from 'lib/constants/sharedConstants';
import tableTranslations from 'lib/translations/table';

interface Props extends WrappedComponentProps {
  title: JSX.Element;
  invitations: InvitationListData[];
}

const InvitationResultInvitationsTable: FC<Props> = (props) => {
  const { title, invitations, intl } = props;

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
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography
              key={`role-${invitation.id}`}
              className="invitation_result_invitation_role"
              variant="body2"
            >
              {INSTANCE_USER_ROLES[invitation.role]}
            </Typography>
          );
        },
      },
    },
    {
      name: 'sentAt',
      label: intl.formatMessage(tableTranslations.invitationSentAt),
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

export default injectIntl(InvitationResultInvitationsTable);
