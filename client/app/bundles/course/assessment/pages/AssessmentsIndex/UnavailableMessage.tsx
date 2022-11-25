import { Lock } from '@mui/icons-material';
import { Tooltip, Typography } from '@mui/material';
import { AssessmentListData } from 'types/course/assessment/assessments';

import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface UnavailableMessageProps {
  for: AssessmentListData;
}

const UnavailableMessage = (props: UnavailableMessageProps): JSX.Element => {
  const { for: assessment } = props;
  const { t } = useTranslation();

  if (!assessment.isStartTimeBegin)
    return (
      <Typography className="italic text-neutral-400" variant="body2">
        {t(translations.openingSoon)}
      </Typography>
    );

  if (!assessment.conditionSatisfied)
    return (
      <Tooltip disableInteractive title={t(translations.unlockableHint)}>
        <div className="flex min-w-[8.5rem] justify-center hover?:animate-shake">
          <Lock
            className="text-neutral-500 hover?:text-neutral-600"
            fontSize="small"
          />
        </div>
      </Tooltip>
    );

  return (
    <Tooltip disableInteractive title={t(translations.unavailableHint)}>
      <Typography className="italic text-neutral-400" variant="body2">
        {t(translations.unavailable)}
      </Typography>
    </Tooltip>
  );
};

export default UnavailableMessage;
