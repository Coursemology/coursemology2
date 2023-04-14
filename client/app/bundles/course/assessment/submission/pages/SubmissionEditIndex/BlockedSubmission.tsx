import { Lock } from '@mui/icons-material';
import { Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

const BlockedSubmission = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <div className="absolute left-1/2 top-1/4 max-w-md text-center">
      <Lock className="text-9xl" />
      <Typography>{t(translations.submissionBlocked)}</Typography>
    </div>
  );
};

export default BlockedSubmission;
