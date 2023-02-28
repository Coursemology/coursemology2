import { Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

import OptionSkeleton from './OptionSkeleton';

const McqIllustration = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <Typography variant="caption">{t(translations.mcq)}</Typography>

      <OptionSkeleton.Choice />
      <OptionSkeleton.Choice checked />
      <OptionSkeleton.Choice />
      <OptionSkeleton.Choice />
    </div>
  );
};

export default McqIllustration;
