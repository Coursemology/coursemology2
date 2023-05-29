import { MouseEventHandler, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Create, Inventory, QuestionMark } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import { AssessmentListData } from 'types/course/assessment/assessments';

import { JustRedirect } from 'api/types';
import useTranslation, { Descriptor } from 'lib/hooks/useTranslation';

import { attemptAssessment } from '../../operations';
import translations from '../../translations';

import UnavailableMessage from './UnavailableMessage';

export const ACTION_LABELS: Record<AssessmentListData['status'], Descriptor> = {
  attempting: translations.resume,
  locked: translations.unlock,
  open: translations.attempt,
  submitted: translations.view,
  unavailable: translations.attempt,
};

interface ActionButtonsProps {
  for: AssessmentListData;
  student: boolean;
}

const ActionButtons = (props: ActionButtonsProps): JSX.Element => {
  const { for: assessment, student } = props;
  const [attempting, setAttempting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const actionButtonUrl =
    assessment.status === 'open' ? '#' : assessment.actionButtonUrl;

  const handleActionButton: MouseEventHandler<HTMLButtonElement> = (
    e,
  ): void => {
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

  return (
    <div className="flex items-center">
      {actionButtonUrl && (
        <Link to={actionButtonUrl}>
          <Button
            className="mr-4 min-w-[8.5rem]"
            disabled={attempting}
            onClick={handleActionButton}
            size="small"
            variant={
              assessment.status === 'submitted' ? 'outlined' : 'contained'
            }
          >
            {t(ACTION_LABELS[assessment.status])}
          </Button>
        </Link>
      )}

      {assessment.editUrl && (
        <Tooltip disableInteractive title={t(translations.editAssessment)}>
          <Link to={assessment.editUrl}>
            <IconButton className="max-sm:!hidden">
              <Create />
            </IconButton>
          </Link>
        </Tooltip>
      )}

      {assessment.submissionsUrl && (
        <Tooltip disableInteractive title={t(translations.submissions)}>
          <Link to={assessment.submissionsUrl}>
            <IconButton>
              <Inventory />
            </IconButton>
          </Link>
        </Tooltip>
      )}

      {assessment.status === 'unavailable' && (
        <UnavailableMessage for={assessment} />
      )}

      {student && assessment.status === 'locked' && (
        <Tooltip
          disableInteractive
          title={t(translations.needsPasswordToAccess)}
        >
          <QuestionMark className="ml-2 text-2xl text-neutral-500" />
        </Tooltip>
      )}
    </div>
  );
};

export default ActionButtons;
