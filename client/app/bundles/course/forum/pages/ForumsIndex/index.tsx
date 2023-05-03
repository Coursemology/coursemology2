import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, AppState } from 'types/store';

import AddButton from 'lib/components/core/buttons/AddButton';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import ScrollToTop from 'lib/components/navigation/ScrollToTop';
import useTranslation from 'lib/hooks/useTranslation';

import MarkAllAsReadButton from '../../components/buttons/MarkAllAsReadButton';
import NextUnreadButton from '../../components/buttons/NextUnreadButton';
import ForumTable from '../../components/tables/ForumTable';
import { fetchForums, markAllAsRead } from '../../operations';
import {
  getAllForums,
  getForumMetadata,
  getForumPermissions,
} from '../../selectors';
import ForumNew from '../ForumNew';

const translations = defineMessages({
  header: {
    id: 'course.forum.ForumsIndex.header',
    defaultMessage: 'Forums',
  },
  newForum: {
    id: 'course.forum.ForumsIndex.newForum',
    defaultMessage: 'New Forum',
  },
  markAllAsReadSuccess: {
    id: 'course.forum.ForumsIndex.markAllAsReadSuccess',
    defaultMessage: 'All topics have been marked as read.',
  },
  markAllAsReadFailed: {
    id: 'course.forum.ForumsIndex.markAllAsReadFailed',
    defaultMessage:
      'Failed to mark all topics as read. Please try again later.',
  },
  fetchForumsFailure: {
    id: 'course.forum.ForumsIndex.fetchForumsFailure',
    defaultMessage: 'Failed to retrieve forum data.',
  },
});

const ForumsIndex: FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isForumNewDialogOpen, setIsForumNewDialogOpen] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const forums = useSelector((state: AppState) => getAllForums(state));
  const forumPermissions = useSelector((state: AppState) =>
    getForumPermissions(state),
  );
  const forumMetadata = useSelector((state: AppState) =>
    getForumMetadata(state),
  );

  useEffect(() => {
    dispatch(fetchForums())
      .finally(() => setIsLoading(false))
      .catch(() => toast.error(t(translations.fetchForumsFailure)));
  }, [dispatch]);

  const handleMarkAllAsRead = (): void => {
    setIsMarking(true);
    dispatch(markAllAsRead())
      .then(() => {
        toast.success(t(translations.markAllAsReadSuccess));
      })
      .catch(() => {
        toast.error(t(translations.markAllAsReadFailed));
      })
      .finally(() => setIsMarking(false));
  };

  const headerToolbars = (
    <>
      <NextUnreadButton
        key="next-unread-button"
        disabled={isMarking}
        nextUnreadTopicUrl={forumMetadata.nextUnreadTopicUrl}
      />
      <MarkAllAsReadButton
        key="mark-all-as-read-button"
        className="max-lg:!hidden"
        disabled={isMarking}
        handleMarkAllAsRead={handleMarkAllAsRead}
        nextUnreadTopicUrl={forumMetadata.nextUnreadTopicUrl}
      />
      {forumPermissions?.canCreateForum && (
        <AddButton
          key="new-forum-button"
          className="new-forum-button"
          onClick={(): void => setIsForumNewDialogOpen(true)}
          tooltip={t(translations.newForum)}
        />
      )}
    </>
  );

  return (
    <>
      <ScrollToTop />
      <PageHeader title={t(translations.header)} toolbars={headerToolbars} />
      {!isLoading && isForumNewDialogOpen && (
        <ForumNew
          onClose={(): void => setIsForumNewDialogOpen(false)}
          open={isForumNewDialogOpen}
        />
      )}
      {isLoading ? <LoadingIndicator /> : <ForumTable forums={forums} />}
    </>
  );
};

export default ForumsIndex;
