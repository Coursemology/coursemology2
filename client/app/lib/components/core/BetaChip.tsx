import { Chip } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations';

const BetaChip = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Chip
      color="success"
      label={t(translations.beta)}
      size="small"
      variant="outlined"
    />
  );
};

export default BetaChip;
