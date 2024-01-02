import { defineMessages } from 'react-intl';
import { Button, Typography } from '@mui/material';
import iconEngaging from 'assets/images/home/icon-engaging.png?url';
import iconGeneral from 'assets/images/home/icon-general.png?url';
import iconSimple from 'assets/images/home/icon-simple.png?url';

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
  iconEngagingTitle: {
    id: 'landing_page.iconEngaging',
    defaultMessage: 'Engaging',
  },
  iconEngagingSubtitle: {
    id: 'landing_page.iconEngagingSubtitle',
    defaultMessage:
      'Coursemology allows educators to add gamification elements, such as experience points, levels and achievements to their classroom exercises and assignments. The gamification elements of Coursemology motivate students to do their assignments and trainings.',
  },
  iconGeneralTitle: {
    id: 'landing_page.iconGeneral',
    defaultMessage: 'General',
  },
  iconGeneralSubtitle: {
    id: 'landing_page.iconGeneralSubtitle',
    defaultMessage:
      'It is built for all subjects. The gamification system of Coursemology does not make any assumptions on the subject. Through Coursemology, any teacher who teaches any subject can turn his course exercises into an online game.',
  },
  iconSimpleTitle: {
    id: 'landing_page.iconEngaging',
    defaultMessage: 'Engaging',
  },
  iconSimpleSubtitle: {
    id: 'landing_page.iconEngagingSubtitle',
    defaultMessage:
      'It is built for all teachers. You do not need to have any programming knowledge to master the platform. Coursemology is easy and intuitive to use for both teachers and students.',
  },
});

const keyFeatures = {
  engaging: {
    icon: iconEngaging,
    title: translations.iconEngagingTitle,
    description: translations.iconEngagingSubtitle,
  },
  general: {
    icon: iconGeneral,
    title: translations.iconGeneralTitle,
    description: translations.iconGeneralSubtitle,
  },
  simple: {
    icon: iconSimple,
    title: translations.iconSimpleTitle,
    description: translations.iconSimpleSubtitle,
  },
};

const LandingPage = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Page unpadded>
      <div className="m-auto min-h-[calc(100vh_-_4.5rem)] flex flex-col items-center justify-center text-center bg-[url('../assets/images/home/jumbotron.png')] bg-no-repeat bg-cover bg-top">
        <Typography
          className="mb-7 max-w-7xl px-5"
          color="text.white"
          variant="h4"
        >
          {t(translations.title)}
        </Typography>

        <Typography
          className="mb-16 max-w-[550px] px-6"
          color="text.white"
          variant="subtitle1"
        >
          {t(translations.subtitle)}
        </Typography>

        <Link to="/users/sign_in">
          <Button color="info" size="large" variant="contained">
            {t(translations.signInToCoursemology)}
          </Button>
        </Link>

        <Typography className="mt-12" color="text.white" variant="body1">
          {t(translations.newToCoursemology)}
        </Typography>

        <Link className="mt-2" to="/users/sign_up">
          <Button color="info" size="large" variant="outlined">
            {t(translations.createAnAccount)}
          </Button>
        </Link>
      </div>

      <div className="mx-auto w-full px-4 md:px-6 lg:px-8 xl:px-[3.75rem] py-16">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 md:max-w-4xl lg:max-w-full lg:grid-cols-3">
          {Object.entries(keyFeatures).map(([key, value]) => (
            <div
              key={key}
              className="flex flex-row items-start gap-6 lg:flex-col"
            >
              <img alt="icon-engaging" src={value.icon} />
              <div className="flex flex-col gap-2">
                <Typography className="font-bold" variant="h5">
                  {t(value.title)}
                </Typography>
                <Typography variant="body2">{t(value.description)}</Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
};

export default LandingPage;
