import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ForumTopicFormData, TopicType } from 'types/course/forums';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import ForumTopicForm from '../../components/forms/ForumTopicForm';
import { createForumTopic } from '../../operations';

interface Props {
  open: boolean;
  onClose: () => void;
  availableTopicTypes?: TopicType[];
  isAnonymousEnabled: boolean;
}

const translations = defineMessages({
  newTopic: {
    id: 'course.forum.ForumTopicNew.newTopic',
    defaultMessage: 'New Topic',
  },
  creationSuccess: {
    id: 'course.forum.ForumTopicNew.creationSuccess',
    defaultMessage: 'Topic {title} has been created.',
  },
  creationFailure: {
    id: 'course.forum.ForumTopicNew.creationFailure',
    defaultMessage: 'Failed to create topic.',
  },
});

const initialValues = {
  title: '',
  text: '',
  topicType: TopicType.NORMAL,
};

const ForumTopicNew: FC<Props> = (props) => {
  const { open, onClose, availableTopicTypes, isAnonymousEnabled } = props;
  const { t } = useTranslation();
  const { forumId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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

        setTimeout(() => navigate(response.redirectUrl), 200);
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
      isAnonymousEnabled={isAnonymousEnabled}
      onClose={onClose}
      onSubmit={handleSubmit}
      open={open}
      title={t(translations.newTopic)}
    />
  );
};

export default ForumTopicNew;
