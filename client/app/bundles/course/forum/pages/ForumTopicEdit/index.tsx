import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ForumTopicEntity, ForumTopicFormData } from 'types/course/forums';
import { AppDispatch } from 'types/store';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';

import ForumTopicForm from '../../components/forms/ForumTopicForm';
import { updateForumTopic } from '../../operations';

interface Props {
  topic: ForumTopicEntity;
  isOpen: boolean;
  onClose: () => void;
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
  updateFailure: {
    id: 'course.forum.topoc.update.failure',
    defaultMessage: 'Failed to update the topic.',
  },
});

const ForumTopicEdit: FC<Props> = (props) => {
  const { isOpen, onClose, topic, navigateToShowAfterUpdate } = props;
  const { t } = useTranslation();
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
        onClose();
      })
      .catch((error) => {
        toast.error(t(translations.updateFailure));

        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };

  return (
    <ForumTopicForm
      editing
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={handleSubmit}
      open={isOpen}
      title={t(translations.editForum)}
    />
  );
};

export default ForumTopicEdit;
