import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AnnouncementFormData } from 'types/course/announcements';
import { AppDispatch, Operation } from 'types/store';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';

import AnnouncementForm from '../../components/forms/AnnouncementForm';

interface Props {
  open: boolean;
  onClose: () => void;
  createOperation: (formData: AnnouncementFormData) => Operation<void>;
  canSticky?: boolean;
}

const translations = defineMessages({
  newAnnouncement: {
    id: 'course.announcement.new.newAnnouncement',
    defaultMessage: 'New Announcement',
  },
  creationSuccess: {
    id: 'course.announcement.new.creationSuccess',
    defaultMessage: 'New announcement posted!',
  },
  creationFailure: {
    id: 'course.announcement.new.creationFailure',
    defaultMessage: 'Failed to create the new announcement',
  },
});

const initialValues = {
  title: '',
  content: '',
  sticky: false,
  // Dates need to be initialized for endtime to change automatically when start time changes
  startAt: new Date(),
  endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // + one week
};

const AnnouncementNew: FC<Props> = (props) => {
  const { open, onClose, createOperation, canSticky = true } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  if (!open) {
    return null;
  }

  const handleSubmit = (
    data: AnnouncementFormData,
    setError,
  ): Promise<void> => {
    return dispatch(createOperation(data))
      .then((_) => {
        onClose();
        toast.success(t(translations.creationSuccess));
      })
      .catch((error) => {
        toast.error(t(translations.creationFailure));

        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };

  return (
    <AnnouncementForm
      canSticky={canSticky}
      editing={false}
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={handleSubmit}
      open={open}
      title={t(translations.newAnnouncement)}
    />
  );
};

export default AnnouncementNew;
