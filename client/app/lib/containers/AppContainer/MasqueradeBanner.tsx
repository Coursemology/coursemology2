import { defineMessages } from 'react-intl';
import { TheaterComedy } from '@mui/icons-material';

import Banner from 'lib/components/core/layouts/Banner';
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
    <Banner
      actions={
        <Link
          className="text-inherit"
          to={stopMasqueradingUrl}
          underline="hover"
        >
          {t(translations.stopMasquerading)}
        </Link>
      }
      className="bg-fuchsia-700 text-white border-only-b-fuchsia-200"
      icon={<TheaterComedy />}
    >
      {t(translations.masquerading, {
        as: userName,
        strong: (chunk) => <strong className="font-semibold">{chunk}</strong>,
      })}
    </Banner>
  );
};

export default MasqueradeBanner;
