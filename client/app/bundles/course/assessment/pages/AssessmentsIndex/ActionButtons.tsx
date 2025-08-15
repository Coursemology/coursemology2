import {
  Assessment,
  Create,
  Inventory,
  QuestionMark,
} from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import { AssessmentListData } from 'types/course/assessment/assessments';

import Link from 'lib/components/core/Link';
import useTranslation, { Descriptor } from 'lib/hooks/useTranslation';

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
  const { t } = useTranslation();

  return (
    <div className="flex items-center">
      {assessment.actionButtonUrl && (
        <Link to={assessment.actionButtonUrl}>
          <Button
            aria-label={t(ACTION_LABELS[assessment.status])}
            className="mr-4 min-w-[8.5rem]"
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

      {assessment.statisticsUrl && (
        <Tooltip
          disableInteractive
          title={t(translations.assessmentStatistics)}
        >
          <Link to={assessment.statisticsUrl}>
            <IconButton>
              <Assessment />
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
        <UnavailableMessage
          hasConditions={{
            conditionSatisfied: assessment.conditionSatisfied,
            assessmentId: assessment.id,
          }}
          isStartTimeBegin={assessment.isStartTimeBegin}
        />
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
