import { defineMessages } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { AppDispatch } from 'types/store';
import { ForumTopicEntity, ForumTopicFormData } from 'types/course/forums';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import useTranslation from 'lib/hooks/useTranslation';

import { updateForumTopic } from '../../operations';
import ForumTopicForm from '../../components/forms/ForumTopicForm';

interface Props {
  topic: ForumTopicEntity;
  isOpen: boolean;
  handleClose: () => void;
  navigateToShowAfterUpdate?: boolean;
}

const translations = defineMessages({
  editForum: {
    id: 'course.forum.topic.edit.header',
    defaultMessage: 'Edit Topic',
  },
  updateSuccess: {
    id: 'course.forum.topic.update.success',
    defaultMessage: 'Topic {title} has been updated.',
  },
  updateFailre: {
    id: 'course.forum.topoc.update.failure',
    defaultMessage: 'Failed to update the topic.',
  },
});

const ForumTopicEdit: FC<Props> = (props) => {
  const { isOpen, handleClose, topic, navigateToShowAfterUpdate } = props;
  const { t } = useTranslation();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const navigate = useNavigate();

  const initialValues = {
    id: topic.id,
    title: topic.title,
    topicType: topic.topicType,
  };

  const dispatch = useDispatch<AppDispatch>();

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (data: ForumTopicFormData, setError): void => {
    dispatch(updateForumTopic(topic.topicUrl, data))
      .then((response) => {
        if (navigateToShowAfterUpdate) {
          navigate(response.topicUrl);
        }
        toast.success(t(translations.updateSuccess, { title: data.title }));
        handleClose();
        setConfirmationDialogOpen(false);
      })
      .catch((error) => {
        toast.error(t(translations.updateFailre));

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
          <ForumTopicForm
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

export default ForumTopicEdit;
