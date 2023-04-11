import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Assessment,
  Create,
  Inventory,
  MonitorHeart,
} from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import {
  AssessmentData,
  AssessmentDeleteResult,
} from 'types/course/assessment/assessments';

import { JustRedirect } from 'api/types';
import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import { PromptText } from 'lib/components/core/dialogs/Prompt';
import PageHeader from 'lib/components/navigation/PageHeader';
import useTranslation from 'lib/hooks/useTranslation';

import { attemptAssessment, deleteAssessment } from '../../actions';
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
  const [attempting, setAttempting] = useState(false);
  const navigate = useNavigate();

  const actionButtonUrl =
    assessment.status === 'open' ? '#' : assessment.actionButtonUrl;

  const handleActionButton = (e): void => {
    if (assessment.status !== 'open') return;
    setAttempting(true);
    e.preventDefault();
    e.stopPropagation();
    toast
      .promise(attemptAssessment(assessment.id), {
        pending: t(translations.attemptingAssessment),
        success: t(translations.createSubmissionSuccessful),
        error: {
          render: ({ data }) => {
            const error = (data as Error)?.message;
            return t(translations.createSubmissionFailed, { error });
          },
        },
      })
      .then((data: JustRedirect) => navigate(data.redirectUrl))
      .catch(() => setAttempting(false));
  };

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
        error: {
          render: ({ data }) => {
            const error = (data as Error)?.message;
            return error || t(translations.errorDeletingAssessment);
          },
        },
      })
      .then((data: AssessmentDeleteResult) => navigate(data.redirect))
      .catch(() => setDeleting(false));
  };

  return (
    <PageHeader returnLink={assessment.indexUrl} title={assessment.title}>
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
            <IconButton
              aria-label={t(translations.editAssessment)}
              className="text-white"
            >
              <Create />
            </IconButton>
          </Link>
        </Tooltip>
      )}

      {assessment.monitoringUrl && (
        <Tooltip disableInteractive title={t(translations.pulsegrid)}>
          <Link to={assessment.monitoringUrl}>
            <IconButton
              aria-label={t(translations.pulsegrid)}
              className="text-white"
            >
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
            <IconButton
              aria-label={t(translations.assessmentStatistics)}
              className="text-white"
            >
              <Assessment />
            </IconButton>
          </Link>
        </Tooltip>
      )}

      {assessment.submissionsUrl && (
        <Tooltip disableInteractive title={t(translations.submissions)}>
          <Link to={assessment.submissionsUrl}>
            <IconButton
              aria-label={t(translations.submissions)}
              className="text-white"
            >
              <Inventory />
            </IconButton>
          </Link>
        </Tooltip>
      )}

      {actionButtonUrl && (
        <Link to={actionButtonUrl}>
          <Button
            aria-label={t(ACTION_LABELS[assessment.status])}
            className="ml-4 bg-white"
            disabled={attempting}
            onClick={handleActionButton}
            variant="outlined"
          >
            {t(ACTION_LABELS[assessment.status])}
          </Button>
        </Link>
      )}
    </PageHeader>
  );
};

export default AssessmentShowHeader;
