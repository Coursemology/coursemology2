import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { StoryShowData } from 'types/course/story/stories';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import DeleteStoryButton from '../component/DeleteStoryButton';
import StoryForm from '../component/StoryForm';

const translations = defineMessages({
  deleteAssessment: {
    id: 'course.assessment.show.deleteAssessment',
    defaultMessage: 'Delete Assessment',
  },
  deletingAssessment: {
    id: 'course.assessment.show.deletingAssessment',
    defaultMessage: 'No going back now. Deleting your assessment...',
  },
  deletingThisAssessment: {
    id: 'course.assessment.show.deletingThisAssessment',
    defaultMessage: 'You are about to delete the following assessment:',
  },
  rooms: {
    id: 'course.story.show.rooms',
    defaultMessage: 'Rooms',
  },
  editStory: {
    id: 'course.story.edit.editStory',
    defaultMessage: 'Edit Story',
  },
});

const StoryEditPage = ({
  id,
  data: { story, gamified, showPersonalizedTimelineFeatures, hasRooms },
}: {
  id: number;
  data: StoryShowData;
}): JSX.Element => {
  const { t } = useTranslation();

  const [submitting, setSubmitting] = useState(false);

  return (
    <Page
      actions={
        <DeleteStoryButton disabled={submitting} id={id} title={story.title} />
      }
      backTo=".."
      title={t(translations.editStory)}
    >
      <StoryForm
        disabled={submitting}
        gamified={gamified}
        hasRooms={hasRooms}
        initialValues={story}
        showPersonalizedTimelineFeatures={showPersonalizedTimelineFeatures}
      />
    </Page>
  );
};

const StoryEdit = (): JSX.Element => {
  const params = useParams<{ storyId: string }>();
  const storyId = getIdFromUnknown(params.storyId);
  if (!storyId) throw new Error('Invalid params');

  return (
    <Preload
      render={<LoadingIndicator />}
      while={() =>
        CourseAPI.stories.stories
          .fetch(storyId)
          .then((response) => response.data)
      }
    >
      {(data) => <StoryEditPage data={data} id={storyId} />}
    </Preload>
  );
};

export default StoryEdit;
