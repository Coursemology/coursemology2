import { FC } from 'react';
import { defineMessages } from 'react-intl';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import HelpIcon from '@mui/icons-material/Help';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Typography,
} from '@mui/material';
import { CourseUserData } from 'types/course/courseUsers';
import {
  FailedInvitationRowData,
  InvitationListData,
  InvitationResult,
  InvitationSuccessRow,
  InvitationUpdatedItem,
} from 'types/course/userInvitations';

import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getManageCourseUsersSharedData } from '../../selectors';
import InvitationResultExistingTable, {
  ExistingRow,
} from '../tables/InvitationResultExistingTable';
import InvitationResultFailedTable from '../tables/InvitationResultFailedTable';
import InvitationResultPrimaryTable from '../tables/InvitationResultPrimaryTable';

interface Props {
  open: boolean;
  handleClose: () => void;
  invitationResult: InvitationResult;
}

const translations = defineMessages({
  header: {
    id: 'course.userInvitations.InvitationResultDialog.header',
    defaultMessage: 'Invitation Summary',
  },
  close: {
    id: 'course.userInvitations.InvitationResultDialog.close',
    defaultMessage: 'Close',
  },
  summary: {
    id: 'course.userInvitations.InvitationResultDialog.summary',
    defaultMessage:
      '{newInvitations} new {newInvitations, plural, one {invitation} other {invitations}} sent, {newEnrollments} directly enrolled, {alreadyInCourse} already in course.',
  },
  summaryFailed: {
    id: 'course.userInvitations.InvitationResultDialog.summaryFailed',
    defaultMessage: '{count} failed.',
  },
  actionableTitle: {
    id: 'course.userInvitations.InvitationResultDialog.actionableTitle',
    defaultMessage: 'Failed ({count})',
  },
  failedRowsSubtitle: {
    id: 'course.userInvitations.InvitationResultDialog.failedRowsSubtitle',
    defaultMessage:
      '{count} {count, plural, one {row} other {rows}} highlighted in red could not be sent',
  },
  newInvitations: {
    id: 'course.userInvitations.InvitationResultDialog.newInvitations',
    defaultMessage: 'New Invitations ({count})',
  },
  newCourseUsers: {
    id: 'course.userInvitations.InvitationResultDialog.newCourseUsers',
    defaultMessage: 'New Course Users ({count})',
  },
  existingInvitations: {
    id: 'course.userInvitations.InvitationResultDialog.existingInvitations',
    defaultMessage: 'Existing Invitations ({count})',
  },
  existingInvitationsInfo: {
    id: 'course.userInvitations.InvitationResultDialog.existingInvitationsInfo',
    defaultMessage:
      'These users already have a pending invitation. They were not re-invited.',
  },
  existingCourseUsers: {
    id: 'course.userInvitations.InvitationResultDialog.existingCourseUsers',
    defaultMessage: 'Existing Course Users ({count})',
  },
  existingCourseUsersInfo: {
    id: 'course.userInvitations.InvitationResultDialog.existingCourseUsersInfo',
    defaultMessage:
      'These users are already enrolled in this course. They were not re-enrolled.',
  },
  externalIdUpdatedInfo: {
    id: 'course.userInvitations.InvitationResultDialog.externalIdUpdatedInfo',
    defaultMessage: 'External IDs were updated where specified.',
  },
  updatedSubtitle: {
    id: 'course.userInvitations.InvitationResultDialog.updatedSubtitle',
    defaultMessage: '{count} updated · shown first',
  },
});

const toSuccessRow = (
  item: InvitationListData | CourseUserData,
  prefix: string,
): InvitationSuccessRow => ({
  id: `${prefix}-${item.id}`,
  name: item.name,
  email: item.email,
  externalId: item.externalId ?? null,
  role: item.role ?? '',
  phantom: item.phantom ?? false,
  timelineAlgorithm: item.timelineAlgorithm,
});

const toUpdatedExistingRow = (item: InvitationUpdatedItem): ExistingRow => ({
  id: item.id,
  name: item.name,
  email: item.email,
  externalId: item.externalId,
  previousExternalId: item.previousExternalId,
  role: item.role,
  phantom: item.phantom,
  timelineAlgorithm: item.timelineAlgorithm,
});

const InvitationResultDialog: FC<Props> = ({
  open,
  handleClose,
  invitationResult,
}) => {
  const { t } = useTranslation();
  const { showPersonalizedTimelineFeatures } = useAppSelector(
    getManageCourseUsersSharedData,
  );

  if (!open) return null;

  const {
    newInvitations = [],
    newCourseUsers = [],
    existingInvitations = [],
    existingCourseUsers = [],
    failedUsers = [],
    updatedInvitations = [],
    updatedCourseUsers = [],
  } = invitationResult;

  const newInvitationRows = newInvitations.map((i) => toSuccessRow(i, 'inv'));
  const newCourseUserRows = newCourseUsers.map((u) => toSuccessRow(u, 'cu'));

  const failedInvitations = existingInvitations.filter(
    (i) => i.isRetryable === false,
  );
  const normalExistingInvitations = existingInvitations.filter(
    (i) => i.isRetryable !== false,
  );

  const failedToSendRows: FailedInvitationRowData[] = failedInvitations.map(
    (inv) => ({
      id: inv.id,
      name: inv.name,
      email: inv.email,
      externalId: inv.externalId ?? undefined,
      role: inv.role,
      phantom: inv.phantom,
      reason: 'failed_to_send' as const,
      timelineAlgorithm: inv.timelineAlgorithm,
    }),
  );

  const allFailedUsers: FailedInvitationRowData[] = [
    ...failedToSendRows,
    ...failedUsers,
  ];

  const existingInvitationRows: ExistingRow[] = [
    ...normalExistingInvitations,
    ...updatedInvitations.map(toUpdatedExistingRow),
  ];
  const existingCourseUserRows: ExistingRow[] = [
    ...existingCourseUsers,
    ...updatedCourseUsers.map(toUpdatedExistingRow),
  ];

  const needsAttentionCount = failedUsers.length + failedInvitations.length;

  const handleDialogClose = (_event: object, reason: string): void => {
    if (reason !== 'backdropClick') handleClose();
  };

  return (
    <Dialog
      disableEscapeKeyDown
      fullWidth
      maxWidth="lg"
      onClose={handleDialogClose}
      open={open}
      sx={{ top: 40, '& .MuiDialog-paper': { overflowY: 'auto' } }}
    >
      <DialogTitle>{t(translations.header)}</DialogTitle>
      <DialogContent>
        <Typography gutterBottom variant="body2">
          {needsAttentionCount > 0 &&
            `${t(translations.summaryFailed, { count: needsAttentionCount })} `}
          {t(translations.summary, {
            newInvitations: newInvitations.length,
            newEnrollments: newCourseUsers.length,
            alreadyInCourse:
              existingInvitationRows.length + existingCourseUserRows.length,
          })}
        </Typography>

        {needsAttentionCount > 0 && (
          <section style={{ marginTop: 24 }}>
            <Typography variant="h6">
              <ErrorOutline
                color="error"
                sx={{ verticalAlign: 'middle', mr: 0.5 }}
              />
              {t(translations.actionableTitle, {
                count: needsAttentionCount,
              })}
            </Typography>
            {failedInvitations.length > 0 && (
              <Typography color="error" variant="caption">
                {t(translations.failedRowsSubtitle, {
                  count: failedInvitations.length,
                })}
              </Typography>
            )}
            <InvitationResultFailedTable
              showPersonalizedTimelineFeatures={
                showPersonalizedTimelineFeatures
              }
              users={allFailedUsers}
            />
          </section>
        )}

        {newInvitationRows.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <Typography variant="h6">
              {t(translations.newInvitations, {
                count: newInvitationRows.length,
              })}
            </Typography>
            <InvitationResultPrimaryTable
              rows={newInvitationRows}
              showPersonalizedTimelineFeatures={
                showPersonalizedTimelineFeatures
              }
            />
          </section>
        )}

        {newCourseUserRows.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <Typography variant="h6">
              {t(translations.newCourseUsers, {
                count: newCourseUserRows.length,
              })}
            </Typography>
            <InvitationResultPrimaryTable
              rows={newCourseUserRows}
              showPersonalizedTimelineFeatures={
                showPersonalizedTimelineFeatures
              }
            />
          </section>
        )}

        {existingInvitationRows.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <Typography variant="h6">
              <Tooltip
                title={[
                  t(translations.existingInvitationsInfo),
                  ...(updatedInvitations.length > 0
                    ? [t(translations.externalIdUpdatedInfo)]
                    : []),
                ].join(' ')}
              >
                <HelpIcon sx={{ fontSize: 16, mr: 0.5 }} />
              </Tooltip>
              {t(translations.existingInvitations, {
                count: existingInvitationRows.length,
              })}
            </Typography>
            {updatedInvitations.length > 0 && (
              <Typography color="primary" variant="caption">
                {t(translations.updatedSubtitle, {
                  count: updatedInvitations.length,
                })}
              </Typography>
            )}
            <InvitationResultExistingTable
              rows={existingInvitationRows}
              showPersonalizedTimelineFeatures={
                showPersonalizedTimelineFeatures
              }
            />
          </section>
        )}

        {existingCourseUserRows.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <Typography variant="h6">
              <Tooltip
                title={[
                  t(translations.existingCourseUsersInfo),
                  ...(updatedCourseUsers.length > 0
                    ? [t(translations.externalIdUpdatedInfo)]
                    : []),
                ].join(' ')}
              >
                <HelpIcon sx={{ fontSize: 16, mr: 0.5 }} />
              </Tooltip>
              {t(translations.existingCourseUsers, {
                count: existingCourseUserRows.length,
              })}
            </Typography>
            {updatedCourseUsers.length > 0 && (
              <Typography color="primary" variant="caption">
                {t(translations.updatedSubtitle, {
                  count: updatedCourseUsers.length,
                })}
              </Typography>
            )}
            <InvitationResultExistingTable
              rows={existingCourseUserRows}
              showPersonalizedTimelineFeatures={
                showPersonalizedTimelineFeatures
              }
            />
          </section>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={handleClose}>
          {t(translations.close)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvitationResultDialog;
