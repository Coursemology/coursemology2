import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch, Operation } from 'types/store';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import { toast } from 'react-toastify';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { AnnouncementFormData } from 'types/course/announcements';
import AnnouncementForm from '../../components/forms/AnnouncementForm';

interface Props extends WrappedComponentProps {
  open: boolean;
  handleClose: () => void;
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
    defaultMessage: 'Failed to created new announcement',
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
  const { intl, open, handleClose, createOperation, canSticky = true } = props;

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  if (!open) {
    return null;
  }

  const onSubmit = (data: AnnouncementFormData, setError): void => {
    dispatch(createOperation(data))
      .then((_) => {
        handleClose();
        setConfirmationDialogOpen(false);
        toast.success(intl.formatMessage(translations.creationSuccess));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.creationFailure));

        if (error.response?.data) {
          // Replace start_at and end_at with startAt and endAt
          if (error.response.data.errors.start_at) {
            error.response.data.errors.startAt =
              error.response.data.errors.start_at;
            delete error.response.data.errors.start_at;
          }
          if (error.response.data.errors.end_at) {
            error.response.data.errors.endAt =
              error.response.data.errors.end_at;
            delete error.response.data.errors.end_at;
          }
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };

  return (
    <>
      <Dialog
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
          {intl.formatMessage(translations.newAnnouncement)}
        </DialogTitle>
        <DialogContent>
          <AnnouncementForm
            editing={false}
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

export default injectIntl(AnnouncementNew);
