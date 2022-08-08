import { FC, ReactElement, memo } from 'react';
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
import {
  InvitationMiniEntity,
  InvitationRowData,
} from 'types/course/userInvitations';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import sharedConstants from 'lib/constants/sharedConstants';
import tableTranslations from 'lib/translations/table';
import equal from 'fast-deep-equal';
import { useSelector } from 'react-redux';
import { AppState } from 'types/store';
import ResendInvitationsButton from '../buttons/ResendAllInvitationsButton';
import { getManageCourseUserPermissions } from '../../selectors';

interface Props extends WrappedComponentProps {
  title: string;
  invitations: InvitationMiniEntity[];
  pendingInvitations?: boolean;
  acceptedInvitations?: boolean;
  renderRowActionComponent?: (invitation: InvitationRowData) => ReactElement;
}

const translations = defineMessages({
  noInvitations: {
    id: 'course.userInvitations.components.tables.UserInvitationsTable.noInvitations',
    defaultMessage: 'There are no {invitationType}',
  },
  pending: {
    id: 'course.userInvitations.components.tables.UserInvitationsTable.invitationType.pending',
    defaultMessage: 'pending',
  },
  accepted: {
    id: 'course.userInvitations.components.tables.UserInvitationsTable.invitationType.accepted',
    defaultMessage: 'accepted',
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
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );

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
    ? intl.formatMessage(translations.pending)
    : intl.formatMessage(translations.accepted);

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: 100,
    rowsPerPageOptions: [100],
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
              {sharedConstants.COURSE_USER_ROLES[invitation.role]}
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

  if (permissions.canManagePersonalTimes) {
    columns.push({
      name: 'personalTimes',
      label: intl.formatMessage(tableTranslations.personalizedTimeline),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={invitation.id} variant="body2">
              {sharedConstants.TIMELINE_ALGORITHMS.find(
                (timeline) => timeline.value === invitation.timelineAlgorithm,
              )?.label ?? '-'}
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
          const invitation = rebuildObjectFromRow(columns, rowData);
          const actionComponent = renderRowActionComponent(invitation);
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

export default memo(
  injectIntl(UserInvitationsTable),
  (prevProps, nextProps) => {
    return equal(prevProps.invitations, nextProps.invitations);
  },
);
