import { defineMessages } from 'react-intl';
import { AppsOutageRounded } from '@mui/icons-material';

import Banner from 'lib/components/core/layouts/Banner';
import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  refreshPage: {
    id: 'lib.components.core.banners.ServerUnreachableBanner.refreshPage',
    defaultMessage: 'Refresh page',
  },
  serverIsUnreachable: {
    id: 'lib.components.core.banners.ServerUnreachableBanner.serverIsUnreachable',
    defaultMessage: 'The server is unreachable. Some actions may not work.',
  },
});

const ServerUnreachableBanner = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Banner
      actions={
        <Link
          className="text-inherit"
          onClick={(): void => window.location.reload()}
          underline="hover"
        >
          {t(translations.refreshPage)}
        </Link>
      }
      className="bg-red-500 text-white"
      icon={<AppsOutageRounded />}
    >
      {t(translations.serverIsUnreachable)}
    </Banner>
  );
};

export default ServerUnreachableBanner;
