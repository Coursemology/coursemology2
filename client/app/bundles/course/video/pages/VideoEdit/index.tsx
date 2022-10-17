import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from 'types/store';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import { toast } from 'react-toastify';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import { VideoFormData, VideoListData } from 'types/course/videos';
import VideoForm from '../../components/forms/VideoForm';
import { updateVideo } from '../../operations';

interface Props extends WrappedComponentProps {
  handleClose: () => void;
  video: VideoListData;
}

const translations = defineMessages({
  updateVideo: {
    id: 'course.video.edit.updateVideo',
    defaultMessage: 'Update Video',
  },
  updateSuccess: {
    id: 'course.video.edit.updateSuccess',
    defaultMessage: '{title} has been successfully updated.',
  },
  updateFailure: {
    id: 'course.video.edit.updateFailure',
    defaultMessage: 'Failed to update {title}.',
  },
});

const VideoEdit: FC<Props> = (props) => {
  const { intl, handleClose, video } = props;

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const initialValues = {
    id: video.id,
    title: video.title,
    tab: video.tabId,
    description: video.description ?? '',
    url: video.url,
    startAt: new Date(video.startTimeInfo.referenceTime!),
    published: video.published,
    hasPersonalTimes: video.hasPersonalTimes,
  };

  const onSubmit = (data: VideoFormData, setError): void => {
    dispatch(updateVideo(video.id, data))
      .then(() => {
        handleClose();
        setConfirmationDialogOpen(false);
        toast.success(
          intl.formatMessage(translations.updateSuccess, { title: data.title }),
        );
      })
      .catch((error) => {
        toast.error(
          intl.formatMessage(translations.updateFailure, {
            title: data.title,
          }),
        );

        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
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
        <DialogTitle>
          {intl.formatMessage(translations.updateVideo)}
        </DialogTitle>
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
            childrenExists={video.videoChildrenExist}
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

export default injectIntl(VideoEdit);
