import { FC } from 'react';
import { Check } from '@mui/icons-material';
import { Chip, Tooltip } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';

const KoditsuChipButton: FC = () => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t(translations.syncedWithKoditsu)}>
      <Chip
        className="ml-2"
        color="success"
        icon={<Check />}
        label={t(translations.koditsuMode)}
        size="medium"
        variant="outlined"
      />
    </Tooltip>
  );
};

export default KoditsuChipButton;
