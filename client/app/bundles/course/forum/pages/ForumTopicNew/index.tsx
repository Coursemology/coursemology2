import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ForumTopicFormData, TopicType } from 'types/course/forums';
import { AppDispatch } from 'types/store';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';

import ForumTopicForm from '../../components/forms/ForumTopicForm';
import { createForumTopic } from '../../operations';

interface Props {
  open: boolean;
  onClose: () => void;
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
  const { open, onClose, availableTopicTypes } = props;
  const { t } = useTranslation();
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
    <ForumTopicForm
      availableTopicTypes={availableTopicTypes}
      editing={false}
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={handleSubmit}
      open={open}
      title={t(translations.newTopic)}
    />
  );
};

export default ForumTopicNew;
