import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import { Operation } from 'store';
import { AnnouncementFormData } from 'types/course/announcements';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { useAppDispatch } from 'lib/hooks/store';
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
  ) => Operation;
  canSticky: boolean;
}

const translations = defineMessages({
  editAnnouncement: {
    id: 'course.announcements.AnnouncementEdit.editAnnouncement',
    defaultMessage: 'Edit Announcement',
  },
  updateSuccess: {
    id: 'course.announcements.AnnouncementEdit.updateSuccess',
    defaultMessage: 'Announcement updated',
  },
  updateFailure: {
    id: 'course.announcements.AnnouncementEdit.updateFailure',
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
  const dispatch = useAppDispatch();

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
      canSticky={canSticky}
      editing
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={handleSubmit}
      open={open}
      title={t(translations.editAnnouncement)}
    />
  );
};

export default AnnouncementEdit;
