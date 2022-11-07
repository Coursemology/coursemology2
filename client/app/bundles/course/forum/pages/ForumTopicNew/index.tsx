import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import useTranslation from 'lib/hooks/useTranslation';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { AppDispatch } from 'types/store';
import { TopicType, ForumTopicFormData } from 'types/course/forums';
import { createForumTopic } from '../../operations';
import ForumTopicForm from '../../components/forms/ForumTopicForm';

interface Props {
  open: boolean;
  handleClose: () => void;
  availableTopicTypes?: TopicType[];
}

const translations = defineMessages({
  newTopic: {
    id: 'course.forum.topic.newTopic',
    defaultMessage: 'New Topic',
  },
  creationSuccess: {
    id: 'course.forum.topic.create.success',
    defaultMessage: 'Topic {title} has been created.',
  },
  creationFailure: {
    id: 'course.forum.topic.create.fail',
    defaultMessage: 'Failed to create topic.',
  },
});

const initialValues = {
  title: '',
  text: '',
  topicType: TopicType.NORMAL,
};

const ForumTopicNew: FC<Props> = (props) => {
  const { open, handleClose, availableTopicTypes } = props;
  const { t } = useTranslation();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { forumId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  if (!open) {
    return null;
  }

  const handleSubmit = (data: ForumTopicFormData, setError): Promise<void> =>
    dispatch(createForumTopic(forumId!, data))
      .then((response) => {
        toast.success(
          t(translations.creationSuccess, {
            title: data.title,
          }),
        );

        setTimeout(() => {
          if (response.data.redirectUrl) {
            navigate(response.data.redirectUrl);
          }
        }, 200);
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
        <DialogTitle>{t(translations.newTopic)}</DialogTitle>
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
            availableTopicTypes={availableTopicTypes}
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

export default ForumTopicNew;
