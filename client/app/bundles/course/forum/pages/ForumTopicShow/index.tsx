import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Box } from '@mui/material';
import { TopicType } from 'types/course/forums';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import PageHeader from 'lib/components/navigation/PageHeader';
import useTranslation from 'lib/hooks/useTranslation';

import ForumTopicManagementButtons from '../../components/buttons/ForumTopicManagementButtons';
import { fetchForumTopic } from '../../operations';
import { getForumTopic } from '../../selectors';

import NewPostDialog from './NewPostDialog';
import Topics from './Topics';

const translations = defineMessages({
  header: {
    id: 'course.forum.topic.show.header',
    defaultMessage: 'Forum Topic Posts',
  },
  fetchPostsFailure: {
    id: 'course.forum.topic.show.fetch.failure',
    defaultMessage: 'Failed to retrieve forum topic data.',
  },
  noPosts: {
    id: 'course.forum.topic.show.noPosts',
    defaultMessage: 'No Post',
  },
  lockedNote: {
    id: 'course.forum.topic.show.lockedNote',
    defaultMessage:
      'You are unable to add new post as this topic has been locked by the teaching staff.',
  },
  topicResolved: {
    id: 'course.forum.topic.show.topicResolved',
    defaultMessage: 'This question topic has been resolved.',
  },
  topicUnresolved: {
    id: 'course.forum.topic.show.topicUnresolved',
    defaultMessage: 'This question topic is unresolved.',
  },
  topicUnresolvedNote: {
    id: 'course.forum.topic.show.topicUnresolvedNote',
    defaultMessage:
      'Mark helpful post(s) as answer(s) to resolve this question.',
  },
});

const ForumTopicShow: FC = () => {
  const { t } = useTranslation();
  const { forumId, topicId } = useParams();
  // Need to get the topic Id number below as sometimes, the topicId in the URL is in the form of slug.
  // The topic id number is required to to select the entity from the redux store.
  const [topicIdNumber, setTopicIdNumber] = useState<number | undefined>();

  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch<AppDispatch>();
  const forumTopic = useSelector((state: AppState) =>
    getForumTopic(state, topicIdNumber),
  );

  useEffect(() => {
    setIsLoading(true);
    if (forumId && topicId) {
      dispatch(fetchForumTopic(forumId, topicId))
        .then((response) => setTopicIdNumber(response))
        .finally(() => setIsLoading(false))
        .catch(() => toast.error(t(translations.fetchPostsFailure)));
    }
  }, [dispatch]);

  const headerToolbars: ReactElement[] = [];
  let forumPageHeaderTitle: ReactElement | string = t(translations.header);

  if (forumTopic) {
    forumPageHeaderTitle = forumTopic.title;
    headerToolbars.push(
      <ForumTopicManagementButtons
        navigateToIndexAfterDelete
        navigateToShowAfterUpdate
        topic={forumTopic}
      />,
    );
  }

  const topicNote = forumTopic &&
    (!forumTopic.permissions.canReplyTopic ||
      forumTopic.topicType === TopicType.QUESTION) && (
      <ul>
        {!forumTopic.permissions.canReplyTopic && (
          <li>{t(translations.lockedNote)}</li>
        )}
        {forumTopic.topicType === TopicType.QUESTION && (
          <li>
            {forumTopic.isResolved
              ? t(translations.topicResolved)
              : `${t(translations.topicUnresolved)} ${
                  forumTopic.permissions.canToggleAnswer
                    ? t(translations.topicUnresolvedNote)
                    : ''
                }`}
          </li>
        )}
      </ul>
    );

  const renderBody =
    !forumTopic ||
    !forumTopic.postTreeIds ||
    forumTopic.postTreeIds.length === 0 ? (
      <Note message={t(translations.noPosts)} />
    ) : (
      <Box className="my-3 space-y-6">
        {topicNote && <Note message={topicNote} />}
        <Topics level={0} postIdsArray={forumTopic.postTreeIds} />
        <NewPostDialog forumTopic={forumTopic} />
      </Box>
    );

  return (
    <>
      <PageHeader title={forumPageHeaderTitle} toolbars={headerToolbars} />
      {isLoading ? <LoadingIndicator /> : renderBody}
    </>
  );
};

export default ForumTopicShow;
