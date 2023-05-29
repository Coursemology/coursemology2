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
    defaultMessage: 'Copyright © {year} Coursemology. All rights reserved.',
  },
});

/**
 * TODO: Populate with appropriate links when pages are ready.
 */
const Footer = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <footer className="flex max-w-[1000px] flex-col space-y-5 p-5 border-only-t-neutral-200">
      <div className="flex flex-row space-x-5">
        <Link href="#">{t(translations.termsOfService)}</Link>

        <Link href="#">{t(translations.privacyPolicy)}</Link>

        <Link external href="mailto:coursemology@gmail.com">
          {t(translations.contactUs)}
        </Link>

        <Link external href="#">
          {t(translations.instructorsGuide)}
        </Link>

        <Link external href="#">
          {t(translations.github)}
        </Link>
      </div>

      <Typography variant="caption">
        {t(translations.copyright, { year: '2023' })}
      </Typography>
    </footer>
  );
};

export default Footer;
