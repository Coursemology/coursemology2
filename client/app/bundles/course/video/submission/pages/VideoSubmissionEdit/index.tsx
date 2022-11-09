import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { VideoEditSubmissionData } from 'types/course/video/submissions';

import CourseAPI from 'api/course';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';

import DescriptionCard from '../../components/misc/DescriptionCard';

import SubmissionEditWithStore from './SubmissionEditWithStore';

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchVideoSubmissionFailure: {
    id: 'course.video.submission.edit.failure',
    defaultMessage: 'Failed to retrieve video submission.',
  },
  watchingVideo: {
    id: 'course.video.submission.edit.watchingVideo',
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
        .edit(submissionId)
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

  if (isLoading) {
    return (
      <>
        <PageHeader title={intl.formatMessage(translations.watchingVideo)} />
        <LoadingIndicator />
      </>
    );
  }

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
    <>
      <PageHeader title={`Watching ${editVideoSubmission?.videoTitle}`} />
      {isLoading ? <LoadingIndicator /> : renderBody}
    </>
  );
};

export default injectIntl(VideoSubmissionEdit);
