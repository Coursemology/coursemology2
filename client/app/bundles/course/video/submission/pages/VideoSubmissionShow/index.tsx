import PageHeader from 'lib/components/pages/PageHeader';
import { getCourseId, getVideoId } from 'lib/helpers/url-helpers';
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CourseAPI from 'api/course';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import Note from 'lib/components/Note';
import { formatLongDateTime } from 'lib/moment';
import { getVideoSubmissionsURL } from 'lib/helpers/url-builders';
import { VideoSubmissionData } from 'types/course/video/submissions';
import StatisticsWithStore from './StatisticsWithStore';
import DescriptionCard from '../../components/misc/DescriptionCard';

const renderSubmissionInfo = (
  videoSubmission: VideoSubmissionData,
): JSX.Element => {
  return (
    <Table className="mt-2 max-w-2xl">
      <TableBody>
        <TableRow>
          <TableCell>Student</TableCell>
          <TableCell>{videoSubmission.courseUserName}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Watched At</TableCell>
          <TableCell>
            {videoSubmission.createdAt &&
              formatLongDateTime(videoSubmission.createdAt)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchVideoSubmissionFailure: {
    id: 'course.video.submission.show.failure',
    defaultMessage: 'Failed to retrieve video submission.',
  },
  sessionStatistics: {
    id: 'course.video.submission.show.sessionStatistics',
    defaultMessage: 'Session Statistics',
  },
  noSession: {
    id: 'course.video.submission.show.noSession',
    defaultMessage: 'No watch statistics available for this submission.',
  },
});

const VideoSubmissionShow: FC<Props> = (props) => {
  const { intl } = props;
  const { submissionId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [videoSubmission, setVideoSubmission] = useState<VideoSubmissionData>();

  useEffect(() => {
    if (submissionId) {
      CourseAPI.video.submissions
        .fetch(submissionId)
        .then((response) => {
          setVideoSubmission(response.data);
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
        <PageHeader
          title="Video"
          returnLink={getVideoSubmissionsURL(getCourseId(), getVideoId())}
        />
        <LoadingIndicator />
      </>
    );
  }

  const renderBody = videoSubmission ? (
    <>
      {videoSubmission.videoDescription && (
        <DescriptionCard description={videoSubmission.videoDescription} />
      )}
      <Card className="mt-6">
        <CardContent>{renderSubmissionInfo(videoSubmission)}</CardContent>
      </Card>
      {videoSubmission.videoStatistics ? (
        <Card className="mt-6">
          <CardHeader
            title={intl.formatMessage(translations.sessionStatistics)}
          />
          <CardContent>
            <StatisticsWithStore
              video={videoSubmission.videoStatistics.video}
              statistics={videoSubmission.videoStatistics.statistics}
            />
          </CardContent>
        </Card>
      ) : (
        <Note message={intl.formatMessage(translations.noSession)} />
      )}
    </>
  ) : (
    <></>
  );
  return (
    <>
      <PageHeader
        title={`Video - ${videoSubmission?.videoTitle}`}
        returnLink={getVideoSubmissionsURL(getCourseId(), getVideoId())}
      />
      {isLoading ? <LoadingIndicator /> : renderBody}
    </>
  );
};

export default injectIntl(VideoSubmissionShow);
