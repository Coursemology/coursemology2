import { defineMessages } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { AppDispatch } from 'types/store';
import { ForumFormData, ForumEntity } from 'types/course/forums';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import useTranslation from 'lib/hooks/useTranslation';

import ForumForm from '../../components/forms/ForumForm';
import { updateForum } from '../../operations';

interface Props {
  forum: ForumEntity;
  isOpen: boolean;
  handleClose: () => void;
  navigateToShowAfterUpdate?: boolean;
}

const translations = defineMessages({
  editForum: {
    id: 'course.forum.edit.header',
    defaultMessage: 'Edit Forum',
  },
  updateSuccess: {
    id: 'course.forum.update.success',
    defaultMessage: 'Forum {title} has been updated.',
  },
  updateFailure: {
    id: 'course.forum.update.failure',
    defaultMessage: 'Failed to update the forum.',
  },
});

const ForumEdit: FC<Props> = (props) => {
  const { isOpen, handleClose, forum, navigateToShowAfterUpdate } = props;
  const { t } = useTranslation();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const navigate = useNavigate();

  const initialValues = {
    id: forum.id,
    name: forum.name,
    description: forum.description,
    forumTopicsAutoSubscribe: forum.forumTopicsAutoSubscribe,
  };

  const dispatch = useDispatch<AppDispatch>();

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (data: ForumFormData, setError): void => {
    dispatch(updateForum(data, forum.id))
      .then((response) => {
        if (navigateToShowAfterUpdate) {
          navigate(response.forumUrl);
        }
        toast.success(t(translations.updateSuccess, { title: data.name }));
        handleClose();
        setConfirmationDialogOpen(false);
      })
      .catch((error) => {
        toast.error(t(translations.updateFailure));

        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };

  return (
    <>
      <Dialog
        className="top-10"
        disableEnforceFocus
        onClose={(): void => {
          if (isDirty) {
            setConfirmationDialogOpen(true);
          } else {
            handleClose();
          }
        }}
        open={isOpen}
        maxWidth="lg"
      >
        <DialogTitle>{t(translations.editForum)}</DialogTitle>
        <DialogContent>
          <ForumForm
            handleClose={(): void => {
              if (isDirty) {
                setConfirmationDialogOpen(true);
              } else {
                handleClose();
              }
            }}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            setIsDirty={setIsDirty}
          />
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        confirmDiscard
        open={confirmationDialogOpen}
        onCancel={(): void => setConfirmationDialogOpen(false)}
        onConfirm={(): void => {
          setConfirmationDialogOpen(false);
          handleClose();
        }}
      />
    </>
  );
};

export default ForumEdit;
