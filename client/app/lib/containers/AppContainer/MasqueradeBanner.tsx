import { defineMessages } from 'react-intl';
import { TheaterComedy } from '@mui/icons-material';

import GlobalAPI from 'api';
import Banner from 'lib/components/core/layouts/Banner';
import Link from 'lib/components/core/Link';
import toast from 'lib/hooks/toast/toast';
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
  errorStoppingMasquerade: {
    id: 'lib.components.core.banners.MasqueradeBanner.errorStoppingMasquerade',
    defaultMessage:
      'An error occurred while stopping masquerade. Try again later.',
  },
});

interface MasqueradeBannerProps {
  as: string;
  stopMasqueradingUrl: string;
}

const MasqueradeBanner = (props: MasqueradeBannerProps): JSX.Element => {
  const { as: userName, stopMasqueradingUrl } = props;

  const { t } = useTranslation();
  const handleClick = async (): Promise<void> => {
    try {
      await GlobalAPI.users.stopMasquerade(stopMasqueradingUrl);
      window.location.href = '/admin/users';
    } catch {
      toast.error(t(translations.errorStoppingMasquerade));
    }
  };

  return (
    <Banner
      actions={
        <Link className="text-inherit" onClick={handleClick} underline="hover">
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
