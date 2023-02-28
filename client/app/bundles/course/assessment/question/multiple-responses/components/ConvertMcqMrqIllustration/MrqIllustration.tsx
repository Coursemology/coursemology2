import { Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

import OptionSkeleton from './OptionSkeleton';

const MrqIllustration = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <Typography variant="caption">{t(translations.mrq)}</Typography>

      <OptionSkeleton.Response checked />
      <OptionSkeleton.Response checked />
      <OptionSkeleton.Response />
      <OptionSkeleton.Response />
    </div>
  );
};

export default MrqIllustration;
