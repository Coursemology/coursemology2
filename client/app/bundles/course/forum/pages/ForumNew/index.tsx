import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';
import { AppDispatch } from 'types/store';
import { createForum } from '../../operations';
import ForumForm from '../../components/forms/ForumForm';

interface Props {
  open: boolean;
  handleClose: () => void;
}

const translations = defineMessages({
  newForum: {
    id: 'course.forum.newForum',
    defaultMessage: 'New Forum',
  },
  creationSuccess: {
    id: 'course.forum.create.success',
    defaultMessage: 'Forum {title} has been created.',
  },
  creationFailure: {
    id: 'course.forum.create.fail',
    defaultMessage: 'Failed to create forum.',
  },
});

const initialValues = {
  name: '',
  description: '',
  forumTopicsAutoSubscribe: true,
};

const ForumNew: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { open, handleClose } = props;
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  if (!open) {
    return null;
  }

  const handleSubmit = (data, setError): Promise<void> =>
    dispatch(createForum(data))
      .then(() => {
        handleClose();
        setConfirmationDialogOpen(false);
        toast.success(
          t(translations.creationSuccess, {
            title: data.name,
          }),
        );
      })
      .catch((error) => {
        toast.error(t(translations.creationFailure));
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });

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
        open={open}
        maxWidth="lg"
      >
        <DialogTitle>{t(translations.newForum)}</DialogTitle>
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

export default ForumNew;
