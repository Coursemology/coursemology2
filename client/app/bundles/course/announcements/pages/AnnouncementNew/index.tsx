import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Operation } from 'store';
import { AnnouncementFormData } from 'types/course/announcements';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import AnnouncementForm, {
  PublishTime,
} from '../../components/forms/AnnouncementForm';

interface Props {
  open: boolean;
  onClose: () => void;
  createOperation: (formData: AnnouncementFormData) => Operation;
  canSticky?: boolean;
}

const translations = defineMessages({
  newAnnouncement: {
    id: 'course.announcements.AnnouncementNew.newAnnouncement',
    defaultMessage: 'New Announcement',
  },
  creationSuccess: {
    id: 'course.announcements.AnnouncementNew.creationSuccess',
    defaultMessage: 'New announcement posted!',
  },
  creationFailure: {
    id: 'course.announcements.AnnouncementNew.creationFailure',
    defaultMessage: 'Failed to create the new announcement',
  },
});

const initialValues: AnnouncementFormData = {
  title: '',
  content: '',
  sticky: false,
  // Dates need to be initialized for endtime to change automatically when start time changes
  startAt: new Date(new Date().setSeconds(0)),
  endAt: new Date(new Date().setSeconds(0) + 7 * 24 * 60 * 60 * 1000), // + one week
};

const AnnouncementNew: FC<Props> = (props) => {
  const { open, onClose, createOperation, canSticky = true } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  if (!open) {
    return null;
  }

  const handleSubmit = (
    data: AnnouncementFormData,
    setError,
    whenToPublish: PublishTime,
  ): Promise<void> => {
    const updatedData = {
      ...data,
      startAt:
        whenToPublish === 'now'
          ? new Date(new Date().setSeconds(0))
          : data.startAt,
    };
    return dispatch(createOperation(updatedData))
      .then(() => {
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
