import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { StoryNewData } from 'types/course/story/stories';

import CourseAPI from 'api/course';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import StoryForm from '../component/StoryForm';

const translations = defineMessages({
  newStory: {
    id: 'course.story.new.newStory',
    defaultMessage: 'New Story',
  },
});

const StoryNewPage = ({
  data: { gamified, showPersonalizedTimelineFeatures },
}: {
  data: StoryNewData;
}): JSX.Element => {
  const { t } = useTranslation();

  const [submitting, setSubmitting] = useState(false);

  return (
    <Page backTo=".." title={t(translations.newStory)}>
      <StoryForm
        dirty
        disabled={submitting}
        gamified={gamified}
        initialValues={{
          title: '',
          description: '',
          published: false,
          startAt: new Date().toISOString(),
          endAt: null,
          bonusEndAt: null,
          providerId: '',
        }}
        showPersonalizedTimelineFeatures={showPersonalizedTimelineFeatures}
      />
    </Page>
  );
};

const StoryNew = (): JSX.Element => (
  <Preload
    render={<LoadingIndicator />}
    while={() =>
      CourseAPI.stories.stories.fetchNew().then((response) => response.data)
    }
  >
    {(data) => <StoryNewPage data={data} />}
  </Preload>
);

export default Object.assign(StoryNew, { handle: translations.newStory });
