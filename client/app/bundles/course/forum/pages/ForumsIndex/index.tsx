import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button, useMediaQuery } from '@mui/material';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
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
import AddButton from 'lib/components/core/buttons/AddButton';

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

  const dispatch = useAppDispatch();
  const forums = useAppSelector(getAllForums);
  const forumPermissions = useAppSelector(getForumPermissions);
  const forumMetadata = useAppSelector(getForumMetadata);

  const minWidthForAddButtonWithText = useMediaQuery('(min-width:720px)');

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
      {forumPermissions?.canCreateForum &&
        (minWidthForAddButtonWithText ? (
          <Button
            key="new-forum-button"
            className="new-forum-button"
            onClick={(): void => setIsForumNewDialogOpen(true)}
            variant="outlined"
          >
            {t(translations.newForum)}
          </Button>
        ) : (
          <AddButton
            key="new-forum-button"
            className="new-forum-button"
            onClick={(): void => {
              setIsForumNewDialogOpen(true);
            }}
            tooltip={t(translations.newForum)}
          />
        ))}
    </>
  );

  return (
    <Page actions={headerToolbars} title={t(translations.header)} unpadded>
      {!isLoading && isForumNewDialogOpen && (
        <ForumNew
          onClose={(): void => setIsForumNewDialogOpen(false)}
          open={isForumNewDialogOpen}
        />
      )}

      {isLoading ? <LoadingIndicator /> : <ForumTable forums={forums} />}
    </Page>
  );
};

const handle = translations.header;

export default Object.assign(ForumsIndex, { handle });
