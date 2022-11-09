import { FC, memo } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppDispatch, AppState } from 'types/store';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';

import VideoForm from '../../components/forms/VideoForm';
import { createVideo } from '../../operations';
import { getVideoTabs } from '../../selectors';

interface Props {
  open: boolean;
  currentTab?: number;
  onClose: () => void;
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
  const { open, onClose, currentTab } = props;
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();
  const videoTabs = useSelector((state: AppState) => getVideoTabs(state));
  const dispatch = useDispatch<AppDispatch>();
  const onSubmit = (data, setError): Promise<void> =>
    dispatch(createVideo(data))
      .then(() => {
        onClose();
        toast.success(
          t(translations.creationSuccess, {
            title: data.title,
          }),
        );
        // Redirect the index page to the correct tab
        setSearchParams({ tab: data.tab });
      })
      .catch((error) => {
        toast.error(
          t(translations.creationFailure, {
            title: data.title,
          }),
        );
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
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
    <VideoForm
      editing={false}
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
      title={t(translations.newVideo)}
    />
  );
};

export default memo(VideoNew);
