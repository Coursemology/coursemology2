import { ComponentProps } from 'react';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Chip } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

const ValidChip = ({
  valid,
  ...chipProps
}: { valid?: boolean } & ComponentProps<typeof Chip>): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Chip
      {...chipProps}
      color={valid ? 'success' : 'error'}
      icon={valid ? <CheckCircle /> : <Cancel />}
      label={
        valid
          ? t(translations.validHeartbeat)
          : t(translations.invalidHeartbeat)
      }
      size="small"
      variant="outlined"
    />
  );
};

export default ValidChip;
