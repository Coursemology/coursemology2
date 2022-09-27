import { FC, useState, memo } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { AppDispatch, AppState } from 'types/store';
import { createVideo } from '../../operations';
import VideoForm from '../../components/forms/VideoForm';
import { getVideoTabs } from '../../selectors';

interface Props extends WrappedComponentProps {
  currentTab?: number;
  handleClose: () => void;
}

const translations = defineMessages({
  newVideo: {
    id: 'course.video.new.newVideo',
    defaultMessage: 'New Video',
  },
  creationSuccess: {
    id: 'course.video.new.success',
    defaultMessage: '{title} was created.',
  },
  creationFailure: {
    id: 'course.video.new.fail',
    defaultMessage: 'Failed to create {title}.',
  },
});

const VideoNew: FC<Props> = (props) => {
  const { handleClose, intl, currentTab } = props;
  const [, setSearchParams] = useSearchParams();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const videoTabs = useSelector((state: AppState) => getVideoTabs(state));
  const dispatch = useDispatch<AppDispatch>();
  const onSubmit = (data, setError): Promise<void> =>
    dispatch(createVideo(data))
      .then(() => {
        handleClose();
        toast.success(
          intl.formatMessage(translations.creationSuccess, {
            title: data.title,
          }),
        );
        // Redirect the index page to the correct tab
        setSearchParams({ tab: data.tab });
      })
      .catch((error) => {
        toast.error(
          intl.formatMessage(translations.creationFailure, {
            title: data.title,
          }),
        );
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        throw error;
      });

  const initialValues = {
    title: '',
    tab: currentTab ?? videoTabs[0]?.id,
    description: '',
    url: '',
    published: false,
    startAt: new Date(),
    hasPersonalTimes: false,
  };

  return (
    <>
      <Dialog
        className="top-10"
        disableEnforceFocus
        onClose={(): void => {
          if (isDirty) {
            setConfirmationDialogOpen(true);
          } else {
            handleClose();
          }
        }}
        open
        maxWidth="lg"
      >
        <DialogTitle>{intl.formatMessage(translations.newVideo)}</DialogTitle>
        <DialogContent>
          <VideoForm
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

export default injectIntl(memo(VideoNew));
