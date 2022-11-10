import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Icon, Tooltip } from '@mui/material';
import { AppDispatch, AppState } from 'types/store';

import AddButton from 'lib/components/core/buttons/AddButton';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import useTranslation from 'lib/hooks/useTranslation';

import ForumManagementButtons from '../../components/buttons/ForumManagementButtons';
import ForumTopicTable from '../../components/tables/ForumTopicTable';
import { fetchForum, markAsRead } from '../../operations';
import { getForum, getForumTopics } from '../../selectors';
import ForumTopicNew from '../ForumTopicNew';

const translations = defineMessages({
  header: {
    id: 'course.forum.show.header',
    defaultMessage: 'Forum Topics',
  },
  newTopic: {
    id: 'course.forum.show.newTopic',
    defaultMessage: 'New Topic',
  },
  AllReadTooltip: {
    id: 'course.forum.show.AllReadTooltip',
    defaultMessage: 'Hooray! All topics in this forum have been read!',
  },
  markAllAsRead: {
    id: 'course.forum.show.markAllAsRead',
    defaultMessage: 'Mark all as read',
  },
  markAllAsReadTooltip: {
    id: 'course.forum.show.markAllAsReadTooltip',
    defaultMessage: 'Mark all topics in the current forum as read',
  },
  markAllAsReadSuccess: {
    id: 'course.forum.show.markAllAsReadSuccess',
    defaultMessage: 'All topics in this forum have been marked as read.',
  },
  markAllAsReadFailed: {
    id: 'course.forum.forum.markAllAsReadFailed',
    defaultMessage:
      'Failed to mark all topics in this forum as read. Please try again later.',
  },
  fetchTopicsFailure: {
    id: 'course.forum.show.fetch.failure',
    defaultMessage: 'Failed to retrieve forum topic data.',
  },
  autoSubscribe: {
    id: 'course.forum.show.autoSubscribe',
    defaultMessage:
      'Users will be automatically subscribed to a topic in this forum when they create a post in the topic.',
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

  const dispatch = useDispatch<AppDispatch>();
  const forum = useSelector((state: AppState) =>
    getForum(state, forumIdNumber),
  );
  const forumTopics = useSelector((state: AppState) =>
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
  }, [dispatch]);

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

  const headerToolbars: ReactElement[] = [];
  let forumPageHeaderTitle: ReactElement | string = t(translations.header);

  if (forum && forumTopics.length > 0 && unreadTopicExists) {
    headerToolbars.push(
      <Tooltip
        title={
          unreadTopicExists
            ? t(translations.markAllAsReadTooltip)
            : t(translations.AllReadTooltip)
        }
      >
        <span>
          <Button
            key="mark-all-as-read-button"
            className="mark-all-as-read-button"
            color="inherit"
            disabled={isMarking}
            onClick={(): void => handleMarkAllAsRead(forum.id)}
          >
            {t(translations.markAllAsRead)}
          </Button>
        </span>
      </Tooltip>,
    );
  }

  if (forum) {
    forumPageHeaderTitle = (
      <div>
        {forum.forumTopicsAutoSubscribe && (
          <Tooltip title={t(translations.autoSubscribe)}>
            <Icon className="fa fa-bell text-3xl" />
          </Tooltip>
        )}{' '}
        {forum.name}
      </div>
    );
    headerToolbars.push(
      <ForumManagementButtons
        disabled={isMarking}
        forum={forum}
        navigateToIndexAfterDelete={true}
        navigateToShowAfterUpdate={true}
      />,
    );
  }

  if (forum?.permissions.canCreateTopic) {
    headerToolbars.push(
      <AddButton
        key="new-topic-button"
        className="new-topic-button"
        onClick={(): void => setIsOpen(true)}
        tooltip={t(translations.newTopic)}
      />,
    );
  }

  return (
    <>
      <PageHeader title={forumPageHeaderTitle} toolbars={headerToolbars} />
      {!isLoading && isOpen && (
        <ForumTopicNew
          availableTopicTypes={forum?.availableTopicTypes}
          onClose={(): void => setIsOpen(false)}
          open={isOpen}
        />
      )}
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <ForumTopicTable forum={forum} forumTopics={forumTopics} />
      )}
    </>
  );
};

export default ForumShow;
