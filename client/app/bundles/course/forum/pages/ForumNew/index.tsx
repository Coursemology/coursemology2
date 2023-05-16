import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import ForumForm from '../../components/forms/ForumForm';
import { createForum } from '../../operations';

interface Props {
  open: boolean;
  onClose: () => void;
}

const translations = defineMessages({
  newForum: {
    id: 'course.forum.ForumNew.newForum',
    defaultMessage: 'New Forum',
  },
  creationSuccess: {
    id: 'course.forum.ForumNew.creationSuccess',
    defaultMessage: 'Forum {title} has been created.',
  },
  creationFailure: {
    id: 'course.forum.ForumNew.creationFailure',
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
  const { open, onClose } = props;
  const dispatch = useAppDispatch();

  if (!open) {
    return null;
  }

  const handleSubmit = (data, setError): Promise<void> =>
    dispatch(createForum(data))
      .then(() => {
        onClose();
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
    <ForumForm
      editing={false}
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={handleSubmit}
      open={open}
      title={t(translations.newForum)}
    />
  );
};

export default ForumNew;
