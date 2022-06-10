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
  idColumn: {
    id: 'course.userInvitations.components.tables.UserInvitationsTable.column.id',
    defaultMessage: 'id',
  },
  nameColumn: {
    id: 'course.userInvitations.components.tables.UserInvitationsTable.column.name',
    defaultMessage: 'Name',
  },
  emailColumn: {
    id: 'course.userInvitations.components.tables.UserInvitationsTable.column.email',
    defaultMessage: 'Email',
  },
  roleColumn: {
    id: 'course.userInvitations.components.tables.UserInvitationsTable.column.role',
    defaultMessage: 'Role',
  },
  phantomColumn: {
    id: 'course.userInvitations.components.tables.UserInvitationsTable.column.phantom',
    defaultMessage: 'Phantom',
  },
  invitationCodeColumn: {
    id: 'course.userInvitations.components.tables.UserInvitationsTable.column.invitationCode',
    defaultMessage: 'Invitation Code',
  },
  sentAtColumn: {
    id: 'course.userInvitations.components.tables.UserInvitationsTable.column.sentAt',
    defaultMessage: 'Invitation Sent At',
  },
  acceptedAtColumn: {
    id: 'course.userInvitations.components.tables.UserInvitationsTable.column.acceptedAt',
    defaultMessage: 'Invitation Accepted At',
  },
  actionsColumn: {
    id: 'course.userInvitations.components.tables.UserInvitationsTable.column.acceptedAt',
    defaultMessage: 'Actions',
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

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: 30,
    rowsPerPageOptions: [15, 30, 50],
    search: true,
    selectableRows: 'none',
    setRowProps: (_row, dataIndex, _rowIndex): Record<string, unknown> => {
      return {
        invitationid: `invitation_${invitations[dataIndex].id}`,
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
      label: intl.formatMessage(translations.idColumn),
      options: {
        display: false,
        filter: false,
        sort: false,
      },
    },
    {
      name: 'name',
      label: intl.formatMessage(translations.nameColumn),
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
      label: intl.formatMessage(translations.emailColumn),
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
      label: intl.formatMessage(translations.roleColumn),
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
      label: intl.formatMessage(translations.phantomColumn),
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
      label: intl.formatMessage(translations.invitationCodeColumn),
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
      label: intl.formatMessage(translations.sentAtColumn),
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
      name: 'sentAt',
      label: intl.formatMessage(translations.acceptedAtColumn),
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
      label: intl.formatMessage(translations.actionsColumn),
      options: {
        empty: true,
        sort: false,
        alignCenter: true,
        customBodyRender: (_value, tableMeta): JSX.Element => {
          const rowData = tableMeta.currentTableData[tableMeta.rowIndex];
          const user = rebuildObjectFromRow(columns, rowData); // maybe can optimize if we push this function to within the buttons?
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
