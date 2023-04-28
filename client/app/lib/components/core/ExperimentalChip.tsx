import { Chip, ChipProps } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations';

const ExperimentalChip = (props: ChipProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Chip
      color="info"
      label={t(translations.experimental)}
      size="small"
      variant="outlined"
      {...props}
    />
  );
};

export default ExperimentalChip;
