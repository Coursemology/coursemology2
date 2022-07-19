import { FC, memo } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Box, Typography } from '@mui/material';
import DataTable from 'lib/components/DataTable';
import sharedConstants from 'lib/constants/sharedConstants';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import tableTranslations from 'lib/components/tables/translations';
import equal from 'fast-deep-equal';
import { InvitationListData } from 'types/course/userInvitations';

interface Props extends WrappedComponentProps {
  title: JSX.Element;
  invitations: InvitationListData[];
}

const InvitationResultInvitationsTable: FC<Props> = (props) => {
  const { title, invitations, intl } = props;

  if (invitations && invitations.length === 0) {
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
        key: `invitation_result_invitation_${invitations[dataIndex].id}`,
        invitationid: `invitation_result_invitation_${invitations[dataIndex].id}`,
        className: `invitation_result_invitation invitation_result_invitation_${invitations[dataIndex].id}`,
      };
    },
    sortOrder: {
      name: 'name',
      direction: 'asc',
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
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography
              key={`name-${invitation.id}`}
              className="invitation_result_invitation_name"
              variant="body2"
            >
              {invitation.name}
            </Typography>
          );
        },
      },
    },
    {
      name: 'email',
      label: intl.formatMessage(tableTranslations.email),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography
              key={`email-${invitation.id}`}
              className="invitation_result_invitation_email"
              variant="body2"
            >
              {invitation.email}
            </Typography>
          );
        },
      },
    },
    {
      name: 'phantom',
      label: intl.formatMessage(tableTranslations.phantom),
      options: {
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
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
      label: intl.formatMessage(tableTranslations.role),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography
              key={`role-${invitation.id}`}
              className="invitation_result_invitation_role"
              variant="body2"
            >
              {sharedConstants.COURSE_USER_ROLES[invitation.role]}
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
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography
              key={`sentAt-${invitation.id}`}
              className="invitation_result_invitation_email"
              variant="body2"
            >
              {invitation.sentAt ?? '-'}
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
        data={invitations}
        columns={columns}
        options={options}
        includeRowNumber
      />
    </Box>
  );
};

export default memo(
  injectIntl(InvitationResultInvitationsTable),
  (prevProps, nextProps) => {
    return equal(prevProps.invitations, nextProps.invitations);
  },
);
