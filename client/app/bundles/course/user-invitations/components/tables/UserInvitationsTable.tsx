import { FC, memo, ReactElement } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import {
  InvitationMiniEntity,
  InvitationRowData,
} from 'types/course/userInvitations';

import DataTable from 'lib/components/core/layouts/DataTable';
import Note from 'lib/components/core/Note';
import { TIMELINE_ALGORITHMS } from 'lib/constants/sharedConstants';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';
import roleTranslations from 'lib/translations/course/users/roles';
import tableTranslations from 'lib/translations/table';

import { getManageCourseUserPermissions } from '../../selectors';
import ResendInvitationsButton from '../buttons/ResendAllInvitationsButton';

interface Props {
  title: string;
  invitations: InvitationMiniEntity[];
  pendingInvitations?: boolean;
  acceptedInvitations?: boolean;
  renderRowActionComponent?: (invitation: InvitationRowData) => ReactElement;
}

const translations = defineMessages({
  noInvitations: {
    id: 'course.userInvitations.UserInvitationsTable.noInvitations',
    defaultMessage: 'There are no {invitationType}',
  },
  pending: {
    id: 'course.userInvitations.UserInvitationsTable.pending',
    defaultMessage: 'pending',
  },
  accepted: {
    id: 'course.userInvitations.UserInvitationsTable.accepted',
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
  } = props;
  const { t } = useTranslation();
  const permissions = useAppSelector(getManageCourseUserPermissions);

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
    ? t(translations.pending)
    : t(translations.accepted);

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: false,
    print: false,
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
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
      label: t(tableTranslations.email),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
      label: t(tableTranslations.role),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={`role-${invitation.id}`} variant="body2">
              {t(roleTranslations[invitation.role])}
            </Typography>
          );
        },
      },
    },
    {
      name: 'phantom',
      label: t(tableTranslations.phantom),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
      name: 'invitationKey',
      label: t(tableTranslations.invitationCode),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
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
      label: t(tableTranslations.invitationSentAt),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={invitation.id} variant="body2">
              {formatLongDateTime(invitation.sentAt)}
            </Typography>
          );
        },
      },
    });
  }

  if (permissions.canManagePersonalTimes) {
    columns.push({
      name: 'timelineAlgorithm',
      label: t(tableTranslations.personalizedTimeline),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={invitation.id} variant="body2">
              {TIMELINE_ALGORITHMS.find(
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
      name: 'confirmedAt',
      label: t(tableTranslations.invitationAcceptedAt),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={invitation.id} variant="body2">
              {formatLongDateTime(invitation.confirmedAt)}
            </Typography>
          );
        },
      },
    });
  }

  if (renderRowActionComponent) {
    columns.push({
      name: 'actions',
      label: t(tableTranslations.actions),
      options: {
        empty: true,
        sort: false,
        alignCenter: true,
        customBodyRender: (_value, tableMeta): JSX.Element => {
          const rowData = tableMeta.rowData;
          const invitation = rebuildObjectFromRow(columns, rowData);
          return renderRowActionComponent(invitation as InvitationRowData);
        },
      },
    });
  }

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

export default memo(UserInvitationsTable, (prevProps, nextProps) => {
  return equal(prevProps.invitations, nextProps.invitations);
});
