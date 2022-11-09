import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { VideoFormData, VideoListData } from 'types/course/videos';
import { AppDispatch } from 'types/store';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';

import VideoForm from '../../components/forms/VideoForm';
import { updateVideo } from '../../operations';

interface Props {
  open: boolean;
  onClose: () => void;
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
  const { open, onClose, video } = props;
  const { t } = useTranslation();
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
        onClose();
        toast.success(t(translations.updateSuccess, { title: data.title }));
      })
      .catch((error) => {
        toast.error(
          t(translations.updateFailure, {
            title: data.title,
          }),
        );

        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };

  return (
    <VideoForm
      childrenExists={video.videoChildrenExist}
      editing={true}
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
      title={t(translations.updateVideo)}
    />
  );
};

export default VideoEdit;
