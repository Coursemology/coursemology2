import { Create, Inventory, QuestionMark } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import { AssessmentListData } from 'types/course/assessment/assessments';

import useTranslation, { Descriptor } from 'lib/hooks/useTranslation';

import translations from './translations';
import UnavailableMessage from './UnavailableMessage';

const ACTION_LABELS: Record<AssessmentListData['status'], Descriptor> = {
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
  const { t } = useTranslation();

  return (
    <div className="flex items-center">
      {(assessment.editUrl || assessment.submissionsUrl) && (
        <div className="hoverable:invisible group-hover?:visible flex h-full items-center transition-position no-hover:mr-4 hoverable:absolute hoverable:right-0 hoverable:pl-8 hoverable:opacity-0 hoverable:bg-fade-to-l-slot-2 group-hover?:right-full group-hover?:opacity-100">
          {assessment.editUrl && (
            <Tooltip disableInteractive title={t(translations.editAssessment)}>
              <IconButton className="max-sm:!hidden" href={assessment.editUrl}>
                <Create />
              </IconButton>
            </Tooltip>
          )}

          {assessment.submissionsUrl && (
            <Tooltip disableInteractive title={t(translations.submissions)}>
              <IconButton href={assessment.submissionsUrl}>
                <Inventory />
              </IconButton>
            </Tooltip>
          )}
        </div>
      )}

      {assessment.actionUrl && (
        <Button
          className="min-w-[8.5rem]"
          href={assessment.actionUrl}
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
      )}

      {assessment.status === 'unavailable' && (
        <UnavailableMessage for={assessment} />
      )}

      {assessment.status === 'attempting' && (
        <Tooltip
          disableInteractive
          title={t(translations.hasOngoingSubmissions)}
        >
          <div className="ml-4 rounded-full bg-amber-500 wh-4 group-hover?:animate-pulse" />
        </Tooltip>
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
