import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import { VideoEditSubmissionData } from 'types/course/video/submissions';

import CourseAPI from 'api/course';
import DescriptionCard from 'lib/components/core/DescriptionCard';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import toast from 'lib/hooks/toast';

import SubmissionEditWithStore from './SubmissionEditWithStore';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'course.video.submission.VideoSubmissionEdit.header',
    defaultMessage: 'Watching {title}',
  },
  fetchVideoSubmissionFailure: {
    id: 'course.video.submission.VideoSubmissionEdit.fetchVideoSubmissionFailure',
    defaultMessage: 'Failed to retrieve video submission.',
  },
  watchingVideo: {
    id: 'course.video.submission.VideoSubmissionEdit.watchingVideo',
    defaultMessage: 'Watching Video',
  },
});

const VideoSubmissionEdit: FC<Props> = (props) => {
  const { intl } = props;
  const { submissionId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [editVideoSubmission, setEditVideoSubmission] =
    useState<VideoEditSubmissionData>();

  useEffect(() => {
    if (submissionId) {
      CourseAPI.video.submissions
        .edit(+submissionId)
        .then((response) => {
          setEditVideoSubmission(response.data);
          setIsLoading(false);
        })
        .catch(() => {
          toast.error(
            intl.formatMessage(translations.fetchVideoSubmissionFailure),
          );
          setIsLoading(false);
        });
    }
  }, [submissionId]);

  if (isLoading) return <LoadingIndicator />;

  const renderBody = editVideoSubmission ? (
    <>
      {editVideoSubmission.videoDescription && (
        <DescriptionCard description={editVideoSubmission.videoDescription} />
      )}
      {editVideoSubmission.videoData && (
        <SubmissionEditWithStore data={editVideoSubmission.videoData} />
      )}
    </>
  ) : null;
  return (
    <Page
      title={intl.formatMessage(translations.header, {
        title: editVideoSubmission?.videoTitle,
      })}
    >
      {isLoading ? <LoadingIndicator /> : renderBody}
    </Page>
  );
};

export default injectIntl(VideoSubmissionEdit);
