import { Chip, ChipProps } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations';

const BetaChip = (props: ChipProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Chip
      color="success"
      label={t(translations.beta)}
      size="small"
      variant="outlined"
      {...props}
    />
  );
};

export default BetaChip;
