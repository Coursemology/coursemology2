import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Tooltip } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import PageHeader from 'lib/components/navigation/PageHeader';
import AddButton from 'lib/components/core/buttons/AddButton';
import useTranslation from 'lib/hooks/useTranslation';
import { fetchForums, markAllAsRead } from '../../operations';
import {
  getAllForums,
  getForumMetadata,
  getForumPermissions,
} from '../../selectors';
import ForumNew from '../ForumNew';
import ForumTable from '../../components/tables/ForumTable';

const translations = defineMessages({
  header: {
    id: 'course.forum.header',
    defaultMessage: 'Forums',
  },
  newForum: {
    id: 'course.forum.index.newForum',
    defaultMessage: 'New Forum',
  },
  nextUnread: {
    id: 'course.forum.index.nextUnread',
    defaultMessage: 'Next Unread',
  },
  nextUnreadTooltip: {
    id: 'course.forum.index.nextUnreadTooltip',
    defaultMessage: 'Jump to next unread topic',
  },
  AllReadTooltip: {
    id: 'course.forum.index.AllReadTooltip',
    defaultMessage: 'Hooray! All topics have been read!',
  },
  markAllAsRead: {
    id: 'course.forum.index.markAllAsRead',
    defaultMessage: 'Mark all as read',
  },
  markAllAsReadTooltip: {
    id: 'course.forum.index.markAllAsReadTooltip',
    defaultMessage: 'Mark all forum topics as read',
  },
  markAllAsReadSuccess: {
    id: 'course.forum.index.markAllAsReadSuccess',
    defaultMessage: 'All topics have been marked as read.',
  },
  markAllAsReadFailed: {
    id: 'course.forum.index.markAllAsReadFailed',
    defaultMessage:
      'Failed to mark all topics as read. Please try again later.',
  },
  fetchForumsFailure: {
    id: 'course.forum.index.fetch.failure',
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

  const headerToolbars: ReactElement[] = [];

  if (forums.length > 0 && forumMetadata.nextUnreadPostUrl) {
    headerToolbars.push(
      <Tooltip
        key="next-unread-tooltip"
        title={
          forumMetadata.nextUnreadPostUrl
            ? t(translations.nextUnreadTooltip)
            : t(translations.AllReadTooltip)
        }
      >
        <span>
          <Button
            key="next-unread-button"
            className="next-unread-button mr-2"
            color="inherit"
            disabled={!forumMetadata.nextUnreadPostUrl || isMarking}
            component={Link}
            to={forumMetadata.nextUnreadPostUrl ?? '#'}
          >
            {t(translations.nextUnread)}
          </Button>
        </span>
      </Tooltip>,
    );

    headerToolbars.push(
      <Tooltip
        key="mark-all-as-read-tooltip"
        title={
          forumMetadata.nextUnreadPostUrl
            ? t(translations.markAllAsReadTooltip)
            : t(translations.AllReadTooltip)
        }
      >
        <span>
          <LoadingButton
            key="mark-all-as-read-button"
            className="mark-all-as-read-button"
            color="inherit"
            disabled={!forumMetadata.nextUnreadPostUrl}
            loading={isMarking}
            onClick={handleMarkAllAsRead}
          >
            {t(translations.markAllAsRead)}
          </LoadingButton>
        </span>
      </Tooltip>,
    );
  }

  if (forumPermissions?.canCreateForum) {
    headerToolbars.push(
      <AddButton
        key="new-forum-button"
        className="new-forum-button"
        onClick={(): void => setIsForumNewDialogOpen(true)}
        tooltip={t(translations.newForum)}
      />,
    );
  }

  return (
    <>
      <PageHeader title={t(translations.header)} toolbars={headerToolbars} />
      {!isLoading && isForumNewDialogOpen && (
        <ForumNew
          open={isForumNewDialogOpen}
          handleClose={(): void => setIsForumNewDialogOpen(false)}
        />
      )}
      {isLoading ? <LoadingIndicator /> : <ForumTable forums={forums} />}
    </>
  );
};

export default ForumsIndex;
