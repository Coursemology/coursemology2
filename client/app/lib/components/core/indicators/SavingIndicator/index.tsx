import { defineMessages } from 'react-intl';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Chip } from '@mui/material';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { SAVING_STATUS } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';

interface SavingIndicatorProps {
  savingStatus: keyof typeof SAVING_STATUS | undefined;
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
  const { savingStatus } = props;
  const { t } = useTranslation();

  if (savingStatus === SAVING_STATUS.None || !savingStatus) return null;

  const chipProps = SavingIndicatorMap[savingStatus];
  if (!chipProps) return null;

  return (
    <Chip
      color={chipProps.color}
      icon={chipProps.icon}
      label={t(chipProps.label)}
      size="medium"
      variant="outlined"
    />
  );
};

export default SavingIndicator;
