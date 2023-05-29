import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import AddButton from 'lib/components/core/buttons/AddButton';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import ForumManagementButtons from '../../components/buttons/ForumManagementButtons';
import MarkAllAsReadButton from '../../components/buttons/MarkAllAsReadButton';
import NextUnreadButton from '../../components/buttons/NextUnreadButton';
import ForumTopicTable from '../../components/tables/ForumTopicTable';
import { fetchForum, markAsRead } from '../../operations';
import { getForum, getForumTopics } from '../../selectors';
import ForumTopicNew from '../ForumTopicNew';

const translations = defineMessages({
  header: {
    id: 'course.forum.FormShow.header',
    defaultMessage: 'Forum Topics',
  },
  newTopic: {
    id: 'course.forum.FormShow.newTopic',
    defaultMessage: 'New Topic',
  },
  markAllAsReadSuccess: {
    id: 'course.forum.FormShow.markAllAsReadSuccess',
    defaultMessage: 'All topics in this forum have been marked as read.',
  },
  markAllAsReadFailed: {
    id: 'course.forum.forum.markAllAsReadFailed',
    defaultMessage:
      'Failed to mark all topics in this forum as read. Please try again later.',
  },
  fetchTopicsFailure: {
    id: 'course.forum.FormShow.fetchTopicsFailure',
    defaultMessage: 'Failed to retrieve forum topic data.',
  },
});

const ForumShow: FC = () => {
  const { t } = useTranslation();
  const { forumId } = useParams();
  // Need to get the forum Id number below as sometimes, the forumId in the URL is in the form of slug.
  // The forum id number is required to to select the entity from the redux store.
  const [forumIdNumber, setForumIdNumber] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const dispatch = useAppDispatch();
  const forum = useAppSelector((state) => getForum(state, forumIdNumber));
  const forumTopics = useAppSelector((state) =>
    getForumTopics(state, forum?.topicIds),
  );
  const unreadTopicExists =
    forumTopics.filter((topic) => topic.isUnread).length > 0;

  useEffect(() => {
    setIsLoading(true);
    if (forumId) {
      dispatch(fetchForum(forumId))
        .then((response) => setForumIdNumber(response))
        .finally(() => setIsLoading(false))
        .catch(() => toast.error(t(translations.fetchTopicsFailure)));
    }
  }, [dispatch, forumId]);

  const handleMarkAllAsRead = (id: number): void => {
    setIsMarking(true);

    dispatch(markAsRead(id))
      .then(() => {
        toast.success(t(translations.markAllAsReadSuccess));
      })
      .catch(() => {
        toast.error(t(translations.markAllAsReadFailed));
      })
      .finally(() => setIsMarking(false));
  };

  const headerToolbars = forum && (
    <>
      <NextUnreadButton
        key="next-unread-button"
        disabled={isMarking}
        nextUnreadTopicUrl={forum.nextUnreadTopicUrl}
      />
      <MarkAllAsReadButton
        key="mark-all-as-read-button"
        className="max-lg:!hidden"
        disabled={isMarking || !unreadTopicExists}
        handleMarkAllAsRead={(): void => handleMarkAllAsRead(forum.id)}
        nextUnreadTopicUrl={unreadTopicExists ? forum.nextUnreadTopicUrl : null}
      />
      <ForumManagementButtons
        disabled={isMarking}
        forum={forum}
        navigateToIndexAfterDelete
        navigateToShowAfterUpdate
        showSubscribeButton
      />
      {forum.permissions.canCreateTopic && (
        <AddButton
          key="new-topic-button"
          className="new-topic-button"
          onClick={(): void => setIsOpen(true)}
          tooltip={t(translations.newTopic)}
        />
      )}
    </>
  );

  const forumPageHeaderTitle = forum ? forum.name : t(translations.header);

  return (
    <Page
      actions={headerToolbars}
      backTo={forum?.rootForumUrl}
      title={forumPageHeaderTitle}
      unpadded
    >
      {!isLoading && isOpen && (
        <ForumTopicNew
          availableTopicTypes={forum?.availableTopicTypes}
          isAnonymousEnabled={Boolean(forum?.permissions.isAnonymousEnabled)}
          onClose={(): void => setIsOpen(false)}
          open={isOpen}
        />
      )}

      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <ForumTopicTable forum={forum} forumTopics={forumTopics} />
      )}
    </Page>
  );
};

export default ForumShow;
