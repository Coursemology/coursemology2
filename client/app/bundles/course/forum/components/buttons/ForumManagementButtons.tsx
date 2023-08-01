import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { MoreHoriz } from '@mui/icons-material';
import { ClickAwayListener, IconButton } from '@mui/material';
import { ForumEntity } from 'types/course/forums';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteForum } from '../../operations';
import ForumEdit from '../../pages/ForumEdit';

import SubscribeButton from './SubscribeButton';

interface Props {
  forum: ForumEntity;
  navigateToIndexAfterDelete?: boolean;
  navigateToShowAfterUpdate?: boolean;
  disabled?: boolean;
  showOnHover?: boolean;
  showSubscribeButton?: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.forum.ForumManagementButtons.deletionSuccess',
    defaultMessage: 'Forum {title} was deleted.',
  },
  deletionFailure: {
    id: 'course.forum.ForumManagementButtons.deletionFailure',
    defaultMessage: 'Failed to delete forum - {error}',
  },
  deletionConfirm: {
    id: 'course.forum.ForumManagementButtons.deletionConfirm',
    defaultMessage: 'Are you sure you wish to delete this forum "{title}"?',
  },
});

const ForumManagementButtons: FC<Props> = (props) => {
  const {
    forum,
    navigateToIndexAfterDelete,
    navigateToShowAfterUpdate,
    disabled,
    showOnHover,
    showSubscribeButton,
  } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showButtons, setShowButtons] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const disableButton = isDeleting || !!disabled;
  const handleEdit = (): void => {
    setIsEditOpen(true);
  };

  const handleDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteForum(forum.id))
      .then(() => {
        toast.success(
          t(translations.deletionSuccess, {
            title: forum.name,
          }),
        );
        if (navigateToIndexAfterDelete) {
          navigate(`/courses/${getCourseId()}/forums`);
        } else {
          setIsDeleting(false);
        }
      })
      .catch((error) => {
        setIsDeleting(false);
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.deletionFailure, {
            error: errorMessage,
          }),
        );
      });
  };

  const managementButtons = (
    <div
      className={
        showOnHover
          ? `${
              showButtons ? '' : 'invisible group-hover:visible'
            } absolute right-0 top-0 flex h-full items-center border-0 pl-20 bg-fade-to-l-neutral-100`
          : 'whitespace-nowrap'
      }
    >
      {showSubscribeButton && (
        <SubscribeButton
          className="max-lg:!hidden"
          disabled={disableButton}
          emailSubscription={forum.emailSubscription}
          entityId={forum.id}
          entityTitle={forum.name}
          entityType="forum"
          entityUrl={forum.forumUrl}
          type="button"
        />
      )}
      {forum.permissions.canEditForum && (
        <EditButton
          className={`forum-edit-${forum.id}`}
          disabled={disableButton}
          onClick={handleEdit}
        />
      )}
      {forum.permissions.canDeleteForum && (
        <DeleteButton
          className={`forum-delete-${forum.id}`}
          confirmMessage={t(translations.deletionConfirm, {
            title: forum.name,
          })}
          disabled={disableButton}
          loading={isDeleting}
          onClick={handleDelete}
        />
      )}
    </div>
  );

  return (
    <ClickAwayListener onClickAway={(): void => setShowButtons(false)}>
      <div className="group relative">
        {showOnHover && !showButtons && (
          <IconButton
            className={`forum-action-${forum.id}`}
            color="inherit"
            onClick={(): void => setShowButtons((prevState) => !prevState)}
          >
            <MoreHoriz />
          </IconButton>
        )}
        {managementButtons}
        <ForumEdit
          forum={forum}
          isOpen={isEditOpen}
          navigateToShowAfterUpdate={navigateToShowAfterUpdate}
          onClose={(): void => {
            setIsEditOpen(false);
          }}
        />
      </div>
    </ClickAwayListener>
  );
};

export default ForumManagementButtons;
