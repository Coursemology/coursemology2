import { defineMessages } from 'react-intl';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Chip, Tooltip } from '@mui/material';
import { formatReadableBytes } from 'utilities';

import submissionTranslations from 'course/assessment/submission/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { MAX_SAVING_SIZE, SAVING_STATUS } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';

interface SavingIndicatorProps {
  savingStatus: keyof typeof SAVING_STATUS | undefined;
  savingSize?: number;
}

const translations = defineMessages({
  saving: {
    id: 'course.assessment.submission.saving',
    defaultMessage: 'Saving',
  },
  saved: {
    id: 'course.assessment.submission.saved',
    defaultMessage: 'Saved',
  },
  savingFailed: {
    id: 'course.assessment.submission.savingFailed',
    defaultMessage: 'Saving Failed',
  },
  answerTooLarge: {
    id: 'course.assessment.submission.answerTooLarge',
    defaultMessage: 'Answer Too Large',
  },
});

const SavingIndicatorMap = {
  Saving: {
    color: 'default' as const,
    icon: <LoadingIndicator bare size={20} />,
    label: translations.saving,
  },
  Saved: {
    color: 'success' as const,
    icon: <CheckCircle />,
    label: translations.saved,
  },
  Failed: {
    color: 'error' as const,
    icon: <Cancel />,
    label: translations.savingFailed,
  },
};

const SavingIndicator = (props: SavingIndicatorProps): JSX.Element | null => {
  const { savingStatus, savingSize } = props;
  const { t } = useTranslation();

  if (savingStatus === SAVING_STATUS.None || !savingStatus) return null;

  const chipProps = SavingIndicatorMap[savingStatus];
  if (!chipProps) return null;

  const answerTooLarge = savingSize && savingSize > MAX_SAVING_SIZE;
  const sizeFragment =
    !answerTooLarge || savingSize === undefined
      ? ''
      : ` (-${formatReadableBytes(savingSize - MAX_SAVING_SIZE)})`;

  return (
    <Tooltip
      title={
        answerTooLarge ? t(submissionTranslations.answerTooLargeError) : ''
      }
    >
      <Chip
        color={chipProps.color}
        icon={chipProps.icon}
        label={`${answerTooLarge ? t(translations.answerTooLarge) : t(chipProps.label)}${sizeFragment}`}
        size="medium"
        variant="outlined"
      />
    </Tooltip>
  );
};

export default SavingIndicator;
