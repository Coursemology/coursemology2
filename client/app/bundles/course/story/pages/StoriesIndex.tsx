import { defineMessages } from 'react-intl';
import { Button, Typography } from '@mui/material';
import { StoriesIndexData } from 'types/course/story/stories';

import CourseAPI from 'api/course';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

interface StoriesIndexPageProps {
  data: StoriesIndexData;
}

const translations = defineMessages({
  stories: {
    id: 'course.story.stories',
    defaultMessage: 'Stories',
  },
});

const StoriesIndexPage = (props: StoriesIndexPageProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Page title={t(translations.stories)}>
      {props.data.stories.map((story) => (
        <div key={story.id}>
          <Typography variant="body2">{story.title}</Typography>
          <Button>Attempt</Button>
          <a href="http://localhost:3000/users/sign-in/silent?provider=coursemology&origin=http://lvh.me:8080">
            Sign in
          </a>
        </div>
      ))}
    </Page>
  );
};

const StoriesIndex = (): JSX.Element => (
  <Preload
    render={<LoadingIndicator />}
    while={() =>
      CourseAPI.stories.stories.index().then((response) => response.data)
    }
  >
    {(data): JSX.Element => <StoriesIndexPage data={data} />}
  </Preload>
);

const handle = translations.stories;

export default Object.assign(StoriesIndex, { handle });
