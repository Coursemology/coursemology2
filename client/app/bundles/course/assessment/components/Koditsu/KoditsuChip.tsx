import { FC } from 'react';
import { Chip } from '@mui/material';

import translations from 'course/assessment/translations';
import useTranslation from 'lib/hooks/useTranslation';

const KoditsuChip: FC = () => {
  const { t } = useTranslation();
  return (
    <Chip
      className="ml-2"
      color="info"
      label={t(translations.koditsuMode)}
      size="small"
      variant="outlined"
    />
  );
};

export default KoditsuChip;
