import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ForumEntity, ForumFormData } from 'types/course/forums';
import { AppDispatch } from 'types/store';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';

import ForumForm from '../../components/forms/ForumForm';
import { updateForum } from '../../operations';

interface Props {
  forum: ForumEntity;
  isOpen: boolean;
  onClose: () => void;
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
  const { isOpen, onClose, forum, navigateToShowAfterUpdate } = props;
  const { t } = useTranslation();
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
    <ForumForm
      editing
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={handleSubmit}
      open={isOpen}
      title={t(translations.editForum)}
    />
  );
};

export default ForumEdit;
