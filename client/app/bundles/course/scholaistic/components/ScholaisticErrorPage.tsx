import { Cancel, SmartToy } from '@mui/icons-material';
import { Typography } from '@mui/material';

import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import { SUPPORT_EMAIL } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';

const ScholaisticErrorPage = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Page className="h-full m-auto flex flex-col items-center justify-center text-center">
      <div className="relative">
        <SmartToy className="text-[6rem]" color="disabled" />

        <Cancel
          className="absolute bottom-0 -right-2 text-[3rem] bg-white rounded-full"
          color="error"
        />
      </div>

      <Typography className="mt-5" variant="h6">
        {t({
          defaultMessage:
            "Either it's supposed to be naught, or something went wrong.",
        })}
      </Typography>

      <Typography
        className="max-w-3xl mt-2"
        color="text.secondary"
        variant="body2"
      >
        {t(
          {
            defaultMessage:
              "<scholaistic>ScholAIstic</scholaistic> is our partner that powers this experience. They were contactable, but didn't give us anything for this request just now. Please try again later, and if this persists, <contact>contact us</contact>.",
          },
          {
            scholaistic: (chunk) => (
              <Link external href="https://scholaistic.com" opensInNewTab>
                {chunk}
              </Link>
            ),
            contact: (chunk) => (
              <Link external href={`mailto:${SUPPORT_EMAIL}`}>
                {chunk}
              </Link>
            ),
          },
        )}
      </Typography>
    </Page>
  );
};

export default ScholaisticErrorPage;
