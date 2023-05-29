import { defineMessages } from 'react-intl';
import { TheaterComedy } from '@mui/icons-material';
import { Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  masquerading: {
    id: 'lib.components.core.banners.MasqueradeBanner.masquerading',
    defaultMessage: 'Masquerading as <strong>{as}</strong>.',
  },
  stopMasquerading: {
    id: 'lib.components.core.banners.MasqueradeBanner.stopMasquerading',
    defaultMessage: 'Stop masquerading',
  },
});

interface MasqueradeBannerProps {
  as: string;
  stopMasqueradingUrl: string;
}

const MasqueradeBanner = (props: MasqueradeBannerProps): JSX.Element => {
  const { as: userName, stopMasqueradingUrl } = props;

  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between space-x-4 bg-fuchsia-700 px-5 py-1 text-white border-only-b-fuchsia-300">
      <div className="flex items-center space-x-4">
        <TheaterComedy />

        <Typography variant="body2">
          {t(translations.masquerading, {
            as: userName,
            strong: (chunk) => (
              <strong className="font-semibold">{chunk}</strong>
            ),
          })}
        </Typography>
      </div>

      <Link
        className="text-inherit"
        href={stopMasqueradingUrl}
        underline="hover"
      >
        {t(translations.stopMasquerading)}
      </Link>
    </div>
  );
};

export default MasqueradeBanner;
