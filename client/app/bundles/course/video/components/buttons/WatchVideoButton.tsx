import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { VideoListData } from 'types/course/videos';

import Link from 'lib/components/core/Link';

interface Props extends WrappedComponentProps {
  video: VideoListData;
}

const translations = defineMessages({
  watch: {
    id: 'course.video.WatchVideoButton.watch',
    defaultMessage: 'Watch',
  },
  reWatch: {
    id: 'course.video.WatchVideoButton.reWatch',
    defaultMessage: 'Rewatch',
  },
  attemptFailure: {
    id: 'course.video.WatchVideoButton.attemptFailure',
    defaultMessage: 'Failed to create an attempt - {error}',
  },
});

const WatchVideoButton: FC<Props> = (props) => {
  const { video, intl } = props;

  const { courseId } = useParams();

  if (video.permissions.canAttempt) {
    if (video.videoSubmissionId) {
      return (
        <Link
          to={`/courses/${courseId}/videos/${video.id}/submissions/${video.videoSubmissionId}/edit`}
        >
          <Button className="bg-white" color="primary" variant="outlined">
            {intl.formatMessage(translations.reWatch)}
          </Button>
        </Link>
      );
    }
    return (
      <Link to={`/courses/${courseId}/videos/${video.id}/attempt`}>
        <Button className="bg-white" color="primary" variant="outlined">
          {intl.formatMessage(translations.watch)}
        </Button>
      </Link>
    );
  }
  return (
    <Button color="primary" disabled variant="outlined">
      {intl.formatMessage(translations.watch)}
    </Button>
  );
};

export default injectIntl(WatchVideoButton);
