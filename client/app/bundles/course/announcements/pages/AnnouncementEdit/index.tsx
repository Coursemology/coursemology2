import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch, Operation } from 'types/store';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import { toast } from 'react-toastify';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import { AnnouncementFormData } from 'types/course/announcements';
import AnnouncementForm from '../../components/forms/AnnouncementForm';

interface Props extends WrappedComponentProps {
  open: boolean;
  handleClose: () => void;
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
    intl,
    open,
    handleClose,
    announcementId,
    initialValues,
    updateOperation,
    canSticky,
  } = props;

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  if (!open) {
    return null;
  }

  const onSubmit = (data: AnnouncementFormData, setError): void => {
    dispatch(updateOperation(announcementId, data))
      .then((_) => {
        handleClose();
        setConfirmationDialogOpen(false);
        toast.success(intl.formatMessage(translations.updateSuccess));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.updateFailure));

        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };

  return (
    <>
      <Dialog
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
        style={{
          top: 40,
        }}
      >
        <DialogTitle>
          {intl.formatMessage(translations.updateAnnouncement)}
        </DialogTitle>
        <DialogContent>
          <AnnouncementForm
            editing
            handleClose={(): void => {
              if (isDirty) {
                setConfirmationDialogOpen(true);
              } else {
                handleClose();
              }
            }}
            initialValues={initialValues}
            onSubmit={onSubmit}
            setIsDirty={setIsDirty}
            canSticky={canSticky}
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

export default injectIntl(AnnouncementEdit);
