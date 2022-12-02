import { Lock } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { AssessmentListData } from 'types/course/assessment/assessments';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface UnavailableMessageProps {
  for: AssessmentListData;
}

const UnavailableMessage = (
  props: UnavailableMessageProps,
): JSX.Element | null => {
  const { for: assessment } = props;
  const { t } = useTranslation();

  if (assessment.isStartTimeBegin && assessment.conditionSatisfied) return null;

  return (
    <Tooltip
      disableInteractive
      title={
        !assessment.isStartTimeBegin
          ? t(translations.openingSoon)
          : t(translations.unlockableHint)
      }
    >
      <div className="flex min-w-[8.5rem] justify-center hover?:animate-shake">
        <Lock
          className="text-neutral-500 hover?:text-neutral-600"
          fontSize="small"
        />
      </div>
    </Tooltip>
  );
};

export default UnavailableMessage;
