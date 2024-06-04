import { defineMessages } from 'react-intl';
import { Assistant, Cancel } from '@mui/icons-material';
import { Typography } from '@mui/material';

import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import { SUPPORT_EMAIL } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  errorFetching: {
    id: 'course.stories.CikgoErrorPage.errorFetching',
    defaultMessage: `Either it's supposed to be naught, or something went wrong.`,
  },
  errorFetchingDescription: {
    id: 'course.stories.CikgoErrorPage.errorFetchingDescription',
    defaultMessage:
      '<cikgo>Cikgo</cikgo> is our partner that powers this experience. They were contactable, but did not give us any ' +
      'resources for this request just now. Please try again later, and if this persists, <link>contact us</link>.',
  },
});

const CikgoErrorPage = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Page className="h-full m-auto flex flex-col items-center justify-center text-center">
      <div className="relative">
        <Assistant className="text-[6rem]" color="disabled" />

        <Cancel
          className="absolute bottom-0 -right-2 text-[3rem] bg-white rounded-full"
          color="error"
        />
      </div>

      <Typography className="mt-5" variant="h6">
        {t(translations.errorFetching)}
      </Typography>

      <Typography
        className="max-w-3xl mt-2"
        color="text.secondary"
        variant="body2"
      >
        {t(translations.errorFetchingDescription, {
          cikgo: (chunk) => (
            <Link external href="https://cikgo.com" opensInNewTab>
              {chunk}
            </Link>
          ),
          link: (chunk) => (
            <Link external href={`mailto:${SUPPORT_EMAIL}`}>
              {chunk}
            </Link>
          ),
        })}
      </Typography>
    </Page>
  );
};

export default CikgoErrorPage;
