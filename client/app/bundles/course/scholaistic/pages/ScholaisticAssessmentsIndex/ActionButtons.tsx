import { Create } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import { ScholaisticAssessmentData } from 'types/course/scholaistic';

import { ACTION_LABELS } from 'course/assessment/pages/AssessmentsIndex/ActionButtons';
import UnavailableMessage from 'course/assessment/pages/AssessmentsIndex/UnavailableMessage';
import assessmentTranslations from 'course/assessment/translations';
import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

const ActionButtons = ({
  assessmentId,
  status,
  isStartTimeBegin,
  showEditButton,
}: {
  assessmentId: ScholaisticAssessmentData['id'];
  status: ScholaisticAssessmentData['status'];
  isStartTimeBegin?: boolean;
  showEditButton?: boolean;
}): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center">
      {status !== 'unavailable' ? (
        <Link to={`${assessmentId}/submission`}>
          <Button
            aria-label={t(ACTION_LABELS[status])}
            className="mr-4 min-w-[8.5rem]"
            size="small"
            variant={status === 'submitted' ? 'outlined' : 'contained'}
          >
            {t(ACTION_LABELS[status])}
          </Button>
        </Link>
      ) : (
        <UnavailableMessage isStartTimeBegin={isStartTimeBegin} />
      )}

      {showEditButton && (
        <Tooltip
          disableInteractive
          title={t(assessmentTranslations.editAssessment)}
        >
          <Link to={`${assessmentId}/edit`}>
            <IconButton className="max-sm:!hidden">
              <Create />
            </IconButton>
          </Link>
        </Tooltip>
      )}
    </div>
  );
};

export default ActionButtons;
