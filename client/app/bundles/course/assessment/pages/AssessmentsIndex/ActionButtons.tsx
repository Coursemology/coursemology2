import { MouseEventHandler, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Create, Inventory, QuestionMark } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import { AssessmentListData } from 'types/course/assessment/assessments';

import { JustRedirect } from 'api/types';
import useTranslation, { Descriptor } from 'lib/hooks/useTranslation';

import { attemptAssessment } from '../../actions';
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

  const actionButton = actionButtonUrl && (
    <Link to={actionButtonUrl}>
      <Button
        className="min-w-[8.5rem]"
        disabled={attempting}
        onClick={handleActionButton}
        size="small"
        variant={assessment.status === 'submitted' ? 'outlined' : 'contained'}
        // Temporary fix for blue link on hover caused by Bootstrap
        // TODO: Remove when Bootstrap is finally removed
        {...((assessment.status === 'open' ||
          assessment.status === 'attempting' ||
          assessment.status === 'locked') && {
          className: 'min-w-[8.5rem] hover:text-white',
        })}
      >
        {t(ACTION_LABELS[assessment.status])}
      </Button>
    </Link>
  );

  return (
    <div className="flex items-center">
      {student ? (
        actionButton
      ) : (
        <div className="hoverable:invisible group-hover?:visible flex h-full items-center transition-position no-hover:mr-4 hoverable:absolute hoverable:right-0 hoverable:pl-8 hoverable:opacity-0 hoverable:bg-fade-to-l-slot-2 group-hover?:right-full group-hover?:opacity-100">
          {actionButton}
        </div>
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
