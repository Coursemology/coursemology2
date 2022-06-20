import { FC, ReactElement } from 'react';
import {
  defineMessages,
  injectIntl,
  FormattedMessage,
  WrappedComponentProps,
} from 'react-intl';
import { Box, Typography } from '@mui/material';
import DataTable from 'lib/components/DataTable';
import Note from 'lib/components/Note';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import { InvitationEntity } from 'types/course/userInvitations';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import sharedConstants from 'lib/constants/sharedConstants';
import tableTranslations from 'lib/components/tables/translations';
import ResendInvitationsButton from '../buttons/ResendAllInvitationsButton';

interface Props extends WrappedComponentProps {
  title: string;
  invitations: InvitationEntity[];
  pendingInvitations?: boolean;
  acceptedInvitations?: boolean;
  renderRowActionComponent?: (any) => ReactElement;
}

const translations = defineMessages({
  noInvitations: {
    id: 'course.userInvitations.components.tables.UserInvitationsTable.noInvitations',
    defaultMessage: 'There are no {invitationType}',
  },
});

const UserInvitationsTable: FC<Props> = (props) => {
  const {
    title,
    invitations,
    pendingInvitations = false,
    acceptedInvitations = false,
    renderRowActionComponent = null,
    intl,
  } = props;

  if (invitations && invitations.length === 0) {
    return (
      <Note
        message={
          <FormattedMessage
            {...translations.noInvitations}
            values={{ invitationType: title.toLowerCase() }}
          />
        }
      />
    );
  }

  const invitationTypePrefix: string = pendingInvitations
    ? 'pending'
    : 'accepted';

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: 30,
    rowsPerPageOptions: [15, 30, 50],
    search: true,
    selectableRows: 'none',
    setTableProps: (): Record<string, unknown> => {
      return { size: 'small' };
    },
    setRowProps: (_row, dataIndex, _rowIndex): Record<string, unknown> => {
      return {
        key: `invitation_${invitations[dataIndex].id}`,
        invitationid: `invitation_${invitations[dataIndex].id}`,
        className: `invitation ${invitationTypePrefix}_invitation_${invitations[dataIndex].id}`,
      };
    },
    sortOrder: {
      name: 'name',
      direction: 'asc',
    },
    viewColumns: false,
    ...(pendingInvitations && {
      customToolbar: () => <ResendInvitationsButton />,
    }),
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
            <Typography key={`name-${invitation.id}`} variant="body2">
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
            <Typography key={`email-${invitation.id}`} variant="body2">
              {invitation.email}
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
            <Typography key={`role-${invitation.id}`} variant="body2">
              {
                sharedConstants.USER_ROLES.find(
                  (role) => role.value === invitation.role,
                )?.label
              }
            </Typography>
          );
        },
      },
    },
    {
      name: 'phantom',
      label: intl.formatMessage(tableTranslations.phantom),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={`phantom-${invitation.id}`} variant="body2">
              {invitation.phantom ? 'Yes' : 'No'}
            </Typography>
          );
        },
      },
    },
    {
      name: 'invitationCode',
      label: intl.formatMessage(tableTranslations.invitationCode),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={`invitationCode-${invitation.id}`} variant="body2">
              {invitation.invitationKey}
            </Typography>
          );
        },
      },
    },
  ];

  if (pendingInvitations) {
    columns.push({
      name: 'sentAt',
      label: intl.formatMessage(tableTranslations.invitationSentAt),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={invitation.id} variant="body2">
              {invitation.sentAt}
            </Typography>
          );
        },
      },
    });
  }

  if (acceptedInvitations) {
    columns.push({
      name: 'acceptedAt',
      label: intl.formatMessage(tableTranslations.invitationAcceptedAt),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={invitation.id} variant="body2">
              {invitation.confirmedAt}
            </Typography>
          );
        },
      },
    });
  }

  if (renderRowActionComponent) {
    columns.push({
      name: 'actions',
      label: intl.formatMessage(tableTranslations.actions),
      options: {
        empty: true,
        sort: false,
        alignCenter: true,
        customBodyRender: (_value, tableMeta): JSX.Element => {
          const rowData = tableMeta.rowData;
          const user = rebuildObjectFromRow(columns, rowData);
          const actionComponent = renderRowActionComponent(user);
          return actionComponent;
        },
      },
    });
  }

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

export default injectIntl(UserInvitationsTable);
