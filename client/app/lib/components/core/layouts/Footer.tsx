import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  termsOfService: {
    id: 'app.Footer.termsOfService',
    defaultMessage: 'Terms of Service',
  },
  privacyPolicy: {
    id: 'app.Footer.privacyPolicy',
    defaultMessage: 'Privacy Policy',
  },
  contactUs: {
    id: 'app.Footer.contactUs',
    defaultMessage: 'Contact Us',
  },
  instructorsGuide: {
    id: 'app.Footer.instructorsGuide',
    defaultMessage: "Instructors' Guide",
  },
  github: {
    id: 'app.Footer.github',
    defaultMessage: 'GitHub',
  },
  copyright: {
    id: 'app.Footer.copyright',
    defaultMessage:
      'Copyright © {from}–{to} Coursemology. All rights reserved.',
  },
});

const Footer = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <footer className="flex max-w-[1000px] flex-col space-y-5 p-5 border-only-t-neutral-200">
      <div className="-mx-3 -my-1 flex flex-wrap">
        <Link
          className="mx-3 my-1"
          href="/pages/terms_of_service"
          opensInNewTab
        >
          {t(translations.termsOfService)}
        </Link>

        <Link className="mx-3 my-1" href="/pages/privacy_policy" opensInNewTab>
          {t(translations.privacyPolicy)}
        </Link>

        <Link
          className="mx-3 my-1"
          external
          href="mailto:coursemology@gmail.com"
        >
          {t(translations.contactUs)}
        </Link>

        <Link
          className="mx-3 my-1"
          external
          href="https://coursemology.github.io/coursemology-help/"
          opensInNewTab
        >
          {t(translations.instructorsGuide)}
        </Link>

        <Link
          className="mx-3 my-1"
          external
          href="https://github.com/Coursemology/coursemology2"
          opensInNewTab
        >
          {t(translations.github)}
        </Link>
      </div>

      <Typography variant="caption">
        {t(translations.copyright, {
          from: FIRST_BUILD_YEAR,
          to: LATEST_BUILD_YEAR,
        })}
      </Typography>
    </footer>
  );
};

export default Footer;
