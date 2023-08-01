import { defineMessages } from 'react-intl';
import { Button, Typography } from '@mui/material';

import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  signInToCoursemology: {
    id: 'landing_page.sign_in_to_coursemology',
    defaultMessage: 'Sign in to Coursemology',
  },
  createAnAccount: {
    id: 'landing_page.create_an_account',
    defaultMessage: 'Create an account',
  },
  newToCoursemology: {
    id: 'landing_page.new_to_coursemology',
    defaultMessage: 'New to Coursemology?',
  },
  title: {
    id: 'landing_page.title',
    defaultMessage: 'Making your class a world of games in a universe of fun.',
  },
  subtitle: {
    id: 'landing_page.subtitle',
    defaultMessage:
      'Coursemology adds fun elements, such as experience points, levels, and achievements to your classroom. ' +
      'These gamification elements motivate students to power through lessons and their assignments.',
  },
});

const LandingPage = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Page className="m-auto flex min-h-[calc(100vh_-_4.5rem)] flex-col items-center justify-center text-center">
      <Typography className="mb-7 max-w-7xl px-5" variant="h3">
        {t(translations.title)}
      </Typography>

      <Typography
        className="mb-20 max-w-4xl px-6"
        color="text.secondary"
        variant="subtitle1"
      >
        {t(translations.subtitle)}
      </Typography>

      <Link to="/users/sign_in">
        <Button size="large" variant="contained">
          {t(translations.signInToCoursemology)}
        </Button>
      </Link>

      <Typography className="mt-20" color="text.secondary" variant="body2">
        {t(translations.newToCoursemology)}
      </Typography>

      <Link className="mt-2" to="/users/sign_up">
        <Button size="large">{t(translations.createAnAccount)}</Button>
      </Link>
    </Page>
  );
};

export default LandingPage;
