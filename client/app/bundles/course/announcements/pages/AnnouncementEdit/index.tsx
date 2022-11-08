import { defineMessages } from 'react-intl';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch, Operation } from 'types/store';

import { toast } from 'react-toastify';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { AnnouncementFormData } from 'types/course/announcements';
import useTranslation from 'lib/hooks/useTranslation';
import AnnouncementForm from '../../components/forms/AnnouncementForm';

interface Props {
  open: boolean;
  onClose: () => void;
  announcementId: number;
  initialValues: {
    title: string;
    content: string;
    sticky: boolean;
    startAt: Date;
    endAt: Date;
  };
  updateOperation: (
    announcementId: number,
    formData: AnnouncementFormData,
  ) => Operation<void>;
  canSticky: boolean;
}

const translations = defineMessages({
  updateAnnouncement: {
    id: 'course.announcement.new.updateAnnouncement',
    defaultMessage: 'Update Announcement',
  },
  updateSuccess: {
    id: 'course.announcement.new.updateSuccess',
    defaultMessage: 'Announcement updated',
  },
  updateFailure: {
    id: 'course.announcement.new.updateFailure',
    defaultMessage: 'Failed to update the announcement',
  },
});

const AnnouncementEdit: FC<Props> = (props) => {
  const {
    open,
    onClose,
    announcementId,
    initialValues,
    updateOperation,
    canSticky,
  } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  if (!open) {
    return null;
  }

  const handleSubmit = (
    data: AnnouncementFormData,
    setError,
  ): Promise<void> => {
    return dispatch(updateOperation(announcementId, data))
      .then((_) => {
        onClose();
        toast.success(t(translations.updateSuccess));
      })
      .catch((error) => {
        toast.error(t(translations.updateFailure));

        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };

  return (
    <AnnouncementForm
      open={open}
      editing
      onClose={onClose}
      title={t(translations.updateAnnouncement)}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      canSticky={canSticky}
    />
  );
};

export default AnnouncementEdit;
