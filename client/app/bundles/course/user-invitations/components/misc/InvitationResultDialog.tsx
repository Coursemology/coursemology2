import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import HelpIcon from '@mui/icons-material/Help';
import WarningAmber from '@mui/icons-material/WarningAmber';
import {
  Alert,
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
  ExternalIdUpdate,
  FailedInvitationRowData,
  InvitationListData,
  InvitationResult,
  InvitationSuccessRow,
} from 'types/course/userInvitations';

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { updateExternalIds } from '../../operations';
import { getManageCourseUsersSharedData } from '../../selectors';
import ExternalIdUpdateTable from '../tables/ExternalIdUpdateTable';
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
  externalIdUpdates: {
    id: 'course.userInvitations.InvitationResultDialog.externalIdUpdates',
    defaultMessage: 'External IDs to update ({count})',
  },
  externalIdUpdatesInfo: {
    id: 'course.userInvitations.InvitationResultDialog.externalIdUpdatesInfo',
    defaultMessage:
      'These users are already invited or enrolled. Their External ID changes only if you apply the file values.',
  },
  invitationsSubheading: {
    id: 'course.userInvitations.InvitationResultDialog.invitationsSubheading',
    defaultMessage: 'Invitations ({count})',
  },
  enrolledMembersSubheading: {
    id: 'course.userInvitations.InvitationResultDialog.enrolledMembersSubheading',
    defaultMessage: 'Enrolled members ({count})',
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
  pendingExternalIdInfo: {
    id: 'course.userInvitations.InvitationResultDialog.pendingExternalIdInfo',
    defaultMessage:
      '{count, plural, one {# row has} other {# rows have}} a different External ID in your file. Current values were kept.',
  },
  externalIdUpdatedDone: {
    id: 'course.userInvitations.InvitationResultDialog.externalIdUpdatedDone',
    defaultMessage: 'External IDs were updated from your file.',
  },
  applyFileValues: {
    id: 'course.userInvitations.InvitationResultDialog.applyFileValues',
    defaultMessage: 'Apply changes ({count})',
  },
  changesApplied: {
    id: 'course.userInvitations.InvitationResultDialog.changesApplied',
    defaultMessage: 'Changes applied',
  },
  applyFailed: {
    id: 'course.userInvitations.InvitationResultDialog.applyFailed',
    defaultMessage:
      "Couldn''t apply — External ID ''{id}'' is now used by another member. No changes were made.",
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

const InvitationResultDialog: FC<Props> = ({
  open,
  handleClose,
  invitationResult,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showPersonalizedTimelineFeatures } = useAppSelector(
    getManageCourseUsersSharedData,
  );
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setApplied(false);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const {
    newInvitations = [],
    newCourseUsers = [],
    existingInvitations = [],
    existingCourseUsers = [],
    failedUsers = [],
    pendingInvitationUpdates = [],
    pendingCourseUserUpdates = [],
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

  const pendingCount =
    pendingInvitationUpdates.length + pendingCourseUserUpdates.length;

  const buildApplyUpdates = (): ExternalIdUpdate[] => [
    ...pendingInvitationUpdates.map((p) => ({
      type: 'invitation' as const,
      id: p.id,
      externalId: p.externalId,
    })),
    ...pendingCourseUserUpdates.map((p) => ({
      type: 'course_user' as const,
      id: p.id,
      externalId: p.externalId,
    })),
  ];

  const applyChanges = async (): Promise<void> => {
    setBusy(true);
    try {
      await dispatch(updateExternalIds(buildApplyUpdates()));
      setApplied(true);
    } catch (error) {
      const id = (
        error as { response?: { data?: { conflictingExternalId?: string } } }
      )?.response?.data?.conflictingExternalId;
      toast.error(t(translations.applyFailed, { id: id ?? '' }));
    } finally {
      setBusy(false);
    }
  };

  const existingInvitationRows: ExistingRow[] = normalExistingInvitations;
  const existingCourseUserRows: ExistingRow[] = existingCourseUsers;

  const needsAttentionCount = failedUsers.length + failedInvitations.length;
  const alreadyInCourseCount =
    normalExistingInvitations.length +
    existingCourseUsers.length +
    pendingInvitationUpdates.length +
    pendingCourseUserUpdates.length;

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
      sx={{
        top: 40,
        '& .MuiDialog-paper': {
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
        },
      }}
    >
      <DialogTitle>{t(translations.header)}</DialogTitle>
      <DialogContent sx={{ flex: '1 1 auto', overflowY: 'auto' }}>
        <Typography gutterBottom variant="body2">
          {needsAttentionCount > 0 &&
            `${t(translations.summaryFailed, { count: needsAttentionCount })} `}
          {t(translations.summary, {
            newInvitations: newInvitations.length,
            newEnrollments: newCourseUsers.length,
            alreadyInCourse: alreadyInCourseCount,
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

        {pendingCount > 0 && (
          <section style={{ marginTop: 24 }}>
            <Typography variant="h6">
              <Tooltip title={t(translations.externalIdUpdatesInfo)}>
                <WarningAmber
                  color="warning"
                  sx={{ verticalAlign: 'middle', mr: 0.5 }}
                />
              </Tooltip>
              {t(translations.externalIdUpdates, { count: pendingCount })}
            </Typography>

            <Alert severity="info" sx={{ mt: 1 }}>
              {applied
                ? t(translations.externalIdUpdatedDone)
                : t(translations.pendingExternalIdInfo, {
                    count: pendingCount,
                  })}
            </Alert>
            <Button
              disabled={applied || busy}
              onClick={applyChanges}
              size="small"
              sx={{ mt: 1, float: 'right' }}
              variant="contained"
            >
              {applied
                ? t(translations.changesApplied)
                : t(translations.applyFileValues, { count: pendingCount })}
            </Button>

            {pendingInvitationUpdates.length > 0 && (
              <>
                <Typography component="div" sx={{ mt: 2 }} variant="subtitle2">
                  {t(translations.invitationsSubheading, {
                    count: pendingInvitationUpdates.length,
                  })}
                </Typography>
                <ExternalIdUpdateTable
                  applied={applied}
                  rows={pendingInvitationUpdates}
                  showPersonalizedTimelineFeatures={
                    showPersonalizedTimelineFeatures
                  }
                />
              </>
            )}

            {pendingCourseUserUpdates.length > 0 && (
              <>
                <Typography component="div" sx={{ mt: 2 }} variant="subtitle2">
                  {t(translations.enrolledMembersSubheading, {
                    count: pendingCourseUserUpdates.length,
                  })}
                </Typography>
                <ExternalIdUpdateTable
                  applied={applied}
                  rows={pendingCourseUserUpdates}
                  showPersonalizedTimelineFeatures={
                    showPersonalizedTimelineFeatures
                  }
                />
              </>
            )}
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
              <Tooltip title={t(translations.existingInvitationsInfo)}>
                <HelpIcon sx={{ fontSize: 16, mr: 0.5 }} />
              </Tooltip>
              {t(translations.existingInvitations, {
                count: existingInvitationRows.length,
              })}
            </Typography>
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
              <Tooltip title={t(translations.existingCourseUsersInfo)}>
                <HelpIcon sx={{ fontSize: 16, mr: 0.5 }} />
              </Tooltip>
              {t(translations.existingCourseUsers, {
                count: existingCourseUserRows.length,
              })}
            </Typography>
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
        <Button color="secondary" disabled={busy} onClick={handleClose}>
          {t(translations.close)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvitationResultDialog;
