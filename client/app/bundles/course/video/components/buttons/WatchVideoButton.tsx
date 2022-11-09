import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import { VideoListData } from 'types/course/videos';

import CourseAPI from 'api/course';
import { getEditVideoSubmissionURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

interface Props extends WrappedComponentProps {
  video: VideoListData;
}

const translations = defineMessages({
  watch: {
    id: 'course.video.buttons.watch',
    defaultMessage: 'Watch',
  },
  reWatch: {
    id: 'course.video.buttons.reWatch',
    defaultMessage: 'Rewatch',
  },
  attemptFailure: {
    id: 'course.video.buttons.attemptFailure',
    defaultMessage: 'Failed to create an attempt - {error}',
  },
});

const WatchVideoButton: FC<Props> = (props) => {
  const { video, intl } = props;
  const navigate = useNavigate();

  if (video.permissions.canAttempt) {
    if (video.videoSubmissionId) {
      return (
        <Button
          className="bg-white"
          color="primary"
          onClick={(): void =>
            navigate(
              getEditVideoSubmissionURL(
                getCourseId(),
                video.id,
                video.videoSubmissionId,
              ),
            )
          }
          variant="outlined"
        >
          {intl.formatMessage(translations.reWatch)}
        </Button>
      );
    }
    return (
      <Button
        className="bg-white"
        color="primary"
        onClick={(): void => {
          CourseAPI.video.submissions
            .create(video.id)
            .then((response) =>
              navigate(
                getEditVideoSubmissionURL(
                  getCourseId(),
                  video.id,
                  response.data.submissionId,
                ),
              ),
            )
            .catch((error) => {
              const errorMessage = error.response?.data?.errors
                ? error.response.data.errors
                : '';

              toast.error(
                intl.formatMessage(translations.attemptFailure, {
                  error: errorMessage,
                }),
              );
            });
        }}
        variant="outlined"
      >
        {intl.formatMessage(translations.watch)}
      </Button>
    );
  }
  return (
    <Button color="primary" disabled={true} variant="outlined">
      {intl.formatMessage(translations.watch)}
    </Button>
  );
};

export default injectIntl(WatchVideoButton);
