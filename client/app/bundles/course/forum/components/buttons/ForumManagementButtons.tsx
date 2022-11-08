import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ClickAwayListener, IconButton } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
// eslint-disable-next-line import/no-extraneous-dependencies
import colors from 'tailwindcss/colors';
import { ForumEntity } from 'types/course/forums';
import { AppDispatch } from 'types/store';
import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';
import SubscribeButton from './SubscribeButton';
import ForumEdit from '../../pages/ForumEdit';
import { deleteForum } from '../../operations';

interface Props {
  forum: ForumEntity;
  navigateToIndexAfterDelete?: boolean;
  navigateToShowAfterUpdate?: boolean;
  disabled?: boolean;
  showOnHover?: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.forum.components.buttons.forumManagement.delete.success',
    defaultMessage: 'Forum {title} was deleted.',
  },
  deletionFailure: {
    id: 'course.forum.components.buttons.forumManagement.delete.fail',
    defaultMessage: 'Failed to delete forum - {error}',
  },
  deletionConfirm: {
    id: 'course.forum.components.buttons.forumManagement.delete.confirm',
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
  } = props;
  const dispatch = useDispatch<AppDispatch>();
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
            } absolute right-0 top-0 flex h-full items-center border-0 pl-20`
          : 'whitespace-nowrap'
      }
      style={
        showOnHover || showButtons
          ? {
              background: `linear-gradient(90deg, transparent 0%, ${colors.neutral[100]} 20%)`,
            }
          : {}
      }
    >
      <SubscribeButton
        emailSubscription={forum.emailSubscription}
        entityType="forum"
        entityId={forum.id}
        entityUrl={forum.forumUrl}
        entityTitle={forum.name}
        disabled={disableButton}
      />

      {forum.permissions.canEditForum && (
        <EditButton
          className={`forum-edit-${forum.id}`}
          onClick={handleEdit}
          disabled={disableButton}
        />
      )}
      {forum.permissions.canDeleteForum && (
        <DeleteButton
          className={`forum-delete-${forum.id}`}
          disabled={disableButton}
          loading={isDeleting}
          onClick={handleDelete}
          confirmMessage={t(translations.deletionConfirm, {
            title: forum.name,
          })}
        />
      )}
    </div>
  );

  return (
    <ClickAwayListener onClickAway={(): void => setShowButtons(false)}>
      <div className="group">
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
          onClose={(): void => {
            setIsEditOpen(false);
          }}
          navigateToShowAfterUpdate={navigateToShowAfterUpdate}
        />
      </div>
    </ClickAwayListener>
  );
};

export default ForumManagementButtons;
