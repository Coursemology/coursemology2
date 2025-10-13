import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { TopicType } from 'types/course/forums';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import ForumTopicManagementButtons from '../../components/buttons/ForumTopicManagementButtons';
import NextUnreadButton from '../../components/buttons/NextUnreadButton';
import { fetchForumTopic } from '../../operations';
import { getForumTopic } from '../../selectors';
import ForumTopicPostNew from '../ForumTopicPostNew';

import TopicPostTrees from './TopicPostTrees';

const translations = defineMessages({
  header: {
    id: 'course.forum.ForumTopicShow.header',
    defaultMessage: 'Forum Topic Posts',
  },
  fetchPostsFailure: {
    id: 'course.forum.ForumTopicShow.fetchPostsFailure',
    defaultMessage: 'Failed to retrieve forum topic data.',
  },
  noPosts: {
    id: 'course.forum.ForumTopicShow.noPosts',
    defaultMessage: 'No Post',
  },
  lockedNote: {
    id: 'course.forum.ForumTopicShow.lockedNote',
    defaultMessage:
      'You are unable to add new post as this topic has been locked by the teaching staff.',
  },
  topicResolved: {
    id: 'course.forum.ForumTopicShow.topicResolved',
    defaultMessage: 'This question topic has been resolved.',
  },
  topicUnresolved: {
    id: 'course.forum.ForumTopicShow.topicUnresolved',
    defaultMessage: 'This question topic is unresolved.',
  },
  topicUnresolvedNote: {
    id: 'course.forum.ForumTopicShow.topicUnresolvedNote',
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

  const dispatch = useAppDispatch();
  const forumTopic = useAppSelector((state) =>
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
  }, [dispatch, forumId, topicId]);

  const headerToolbars: ReactElement[] = [];
  let forumPageHeaderTitle: ReactElement | string = t(translations.header);

  if (forumTopic) {
    forumPageHeaderTitle = forumTopic.title;

    headerToolbars.push(
      <NextUnreadButton
        key="next-unread-button"
        disabled={false}
        nextUnreadTopicUrl={forumTopic.nextUnreadTopicUrl}
      />,
    );
    headerToolbars.push(
      <ForumTopicManagementButtons
        key={forumTopic.id}
        pageType="TopicShow"
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
    !forumTopic?.postTreeIds || forumTopic.postTreeIds.length === 0 ? (
      <Note message={t(translations.noPosts)} />
    ) : (
      <Box className="my-3 space-y-6">
        {topicNote && (
          <Note
            message={topicNote}
            severity={forumTopic.isResolved ? 'success' : 'warning'}
          />
        )}
        <TopicPostTrees level={0} postIdsArray={forumTopic.postTreeIds} />
        <ForumTopicPostNew forumTopic={forumTopic} />
      </Box>
    );

  return (
    <Page
      actions={headerToolbars}
      backTo={forumTopic?.forumUrl}
      title={forumPageHeaderTitle}
    >
      {isLoading ? <LoadingIndicator /> : renderBody}
    </Page>
  );
};

export default ForumTopicShow;
