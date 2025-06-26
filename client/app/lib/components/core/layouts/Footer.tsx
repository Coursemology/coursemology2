import { defineMessages } from 'react-intl';
import { FacebookOutlined, GitHub } from '@mui/icons-material';
import { Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import { useAttributions } from 'lib/components/wrappers/AttributionsProvider';
import { useFooter } from 'lib/components/wrappers/FooterProvider';
import { SUPPORT_EMAIL } from 'lib/constants/sharedConstants';
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
  reportIssue: {
    id: 'app.Footer.reportIssue',
    defaultMessage: 'Report an Issue',
  },
  github: {
    id: 'app.Footer.github',
    defaultMessage: 'GitHub',
  },
  copyright: {
    id: 'app.Footer.copyright',
    defaultMessage: '© {from}–{to} Coursemology.',
  },
});

const Footer = (): JSX.Element | null => {
  const { t } = useTranslation();

  const enabled = useFooter();
  const attributions = useAttributions();

  if (!enabled) return null;

  return (
    <footer className="bg-neutral-50 p-5 border-only-t-neutral-200">
      <div className="m-auto flex flex-col space-y-5">
        <section className="-mx-3 -my-1 flex flex-wrap">
          <Link
            className="mx-3 my-1"
            opensInNewTab
            to="/pages/terms_of_service"
          >
            {t(translations.termsOfService)}
          </Link>

          <Link className="mx-3 my-1" opensInNewTab to="/pages/privacy_policy">
            {t(translations.privacyPolicy)}
          </Link>

          <Link className="mx-3 my-1" external href={`mailto:${SUPPORT_EMAIL}`}>
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
            href="https://github.com/Coursemology/coursemology2/issues"
            opensInNewTab
          >
            {t(translations.reportIssue)}
          </Link>
        </section>

        <section className="flex flex-col">
          {attributions.map((attribution) => (
            <Typography
              key={attribution.name}
              color="text.secondary"
              variant="caption"
            >
              {attribution.content}
            </Typography>
          ))}
        </section>

        <section className="flex items-end justify-between">
          <Typography color="text.secondary" variant="caption">
            {t(translations.copyright, {
              from: FIRST_BUILD_YEAR,
              to: LATEST_BUILD_YEAR,
            })}
          </Typography>

          <div className="space-x-3 text-neutral-500">
            <Link
              color="inherit"
              href="https://www.facebook.com/coursemology"
              opensInNewTab
            >
              <FacebookOutlined className="translate-y-[0.1rem] text-[3.3rem]" />
            </Link>

            <Link
              color="inherit"
              href="https://github.com/Coursemology/coursemology2"
              opensInNewTab
            >
              <GitHub className="text-[3rem]" fontSize="large" />
            </Link>
          </div>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
