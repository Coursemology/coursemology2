import { FC } from 'react';
import { Alert } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

const ShuffleRandomizationManager: FC = () => {
  const { t } = useTranslation();
  return (
    <Alert icon={false} severity="info">
      {t(translations.shuffleRandomizationModeDescription)}
    </Alert>
  );
};

export default ShuffleRandomizationManager;
