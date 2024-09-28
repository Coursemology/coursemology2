import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Assessment,
  Create,
  Inventory,
  MonitorHeart,
  PersonAdd,
} from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import {
  AssessmentData,
  AssessmentDeleteResult,
} from 'types/course/assessment/assessments';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import { PromptText } from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import {
  deleteAssessment,
  inviteToKoditsu,
} from '../../operations/assessments';
import translations from '../../translations';
import { ACTION_LABELS } from '../AssessmentsIndex/ActionButtons';

interface AssessmentShowHeaderProps {
  with: AssessmentData;
}

const AssessmentShowHeader = (
  props: AssessmentShowHeaderProps,
): JSX.Element => {
  const { with: assessment } = props;
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const [inviting, setInviting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = (): Promise<void> => {
    const deleteUrl = assessment.deleteUrl;
    if (!deleteUrl)
      throw new Error(
        `Delete URL for assessment '${assessment.title}' is ${deleteUrl}.`,
      );

    setDeleting(true);

    return toast
      .promise(deleteAssessment(deleteUrl), {
        pending: t(translations.deletingAssessment),
        success: t(translations.assessmentDeleted),
      })
      .then((data: AssessmentDeleteResult) => navigate(data.redirect))
      .catch((error) => {
        const message = (error as Error)?.message;
        toast.error(message || t(translations.errorDeletingAssessment));

        setDeleting(false);
      });
  };

  return (
    <>
      {assessment.deleteUrl && (
        <DeleteButton
          aria-label={t(translations.deleteAssessment)}
          confirmLabel={t(translations.deleteAssessment)}
          disabled={deleting}
          onClick={handleDelete}
          title={t(translations.sureDeletingAssessment)}
        >
          <PromptText>{t(translations.deletingThisAssessment)}</PromptText>
          <PromptText className="italic">{assessment.title}</PromptText>
          <PromptText>{t(translations.deleteAssessmentWarning)}</PromptText>
        </DeleteButton>
      )}

      {assessment.editUrl && (
        <Tooltip disableInteractive title={t(translations.editAssessment)}>
          <Link to={assessment.editUrl}>
            <IconButton aria-label={t(translations.editAssessment)}>
              <Create />
            </IconButton>
          </Link>
        </Tooltip>
      )}

      {assessment.monitoringUrl && (
        <Tooltip disableInteractive title={t(translations.pulsegrid)}>
          <Link to={assessment.monitoringUrl}>
            <IconButton aria-label={t(translations.pulsegrid)}>
              <MonitorHeart />
            </IconButton>
          </Link>
        </Tooltip>
      )}

      {assessment.statisticsUrl && (
        <Tooltip
          disableInteractive
          title={t(translations.assessmentStatistics)}
        >
          <Link to={assessment.statisticsUrl}>
            <IconButton aria-label={t(translations.assessmentStatistics)}>
              <Assessment />
            </IconButton>
          </Link>
        </Tooltip>
      )}

      {assessment.submissionsUrl && (
        <Tooltip disableInteractive title={t(translations.submissions)}>
          <Link to={assessment.submissionsUrl}>
            <IconButton aria-label={t(translations.submissions)}>
              <Inventory />
            </IconButton>
          </Link>
        </Tooltip>
      )}

      {assessment.permissions.canInviteToKoditsu &&
        assessment.isKoditsuAssessmentEnabled && (
          <Tooltip disableInteractive title={t(translations.inviteToKoditsu)}>
            <IconButton
              aria-label={t(translations.inviteToKoditsu)}
              disabled={inviting}
              onClick={() => {
                setInviting(true);

                return toast
                  .promise(inviteToKoditsu(assessment.id), {
                    pending: t(translations.invitingUserToKoditsu),
                    success: t(translations.invitingUserToKoditsuSuccess),
                  })
                  .catch(() => {
                    toast.error(t(translations.invitingUserToKoditsuFailure));
                  })
                  .finally(() => setInviting(false));
              }}
            >
              <PersonAdd />
            </IconButton>
          </Tooltip>
        )}

      {assessment.actionButtonUrl && (
        <Link
          opensInNewTab={assessment.isKoditsuAssessmentEnabled}
          to={assessment.actionButtonUrl}
        >
          <Button
            aria-label={t(ACTION_LABELS[assessment.status])}
            className="ml-4"
            variant="contained"
          >
            {t(ACTION_LABELS[assessment.status])}
          </Button>
        </Link>
      )}
    </>
  );
};

export default AssessmentShowHeader;
