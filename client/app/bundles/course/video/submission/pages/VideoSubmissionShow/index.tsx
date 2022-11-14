import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import { VideoSubmissionData } from 'types/course/video/submissions';

import CourseAPI from 'api/course';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import PageHeader from 'lib/components/navigation/PageHeader';
import { getVideoSubmissionsURL } from 'lib/helpers/url-builders';
import { getCourseId, getVideoId } from 'lib/helpers/url-helpers';
import { formatLongDateTime } from 'lib/moment';

import DescriptionCard from '../../components/misc/DescriptionCard';

import StatisticsWithStore from './StatisticsWithStore';

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
  video: {
    id: 'course.video.submission.show.video',
    defaultMessage: 'Video',
  },
  videoTitle: {
    id: 'course.video.submission.show.videoTitle',
    defaultMessage: 'Video - {title}',
  },
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
          returnLink={getVideoSubmissionsURL(getCourseId(), getVideoId())}
          title={intl.formatMessage(translations.video)}
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
              statistics={videoSubmission.videoStatistics.statistics}
              video={videoSubmission.videoStatistics.video}
            />
          </CardContent>
        </Card>
      ) : (
        <Note message={intl.formatMessage(translations.noSession)} />
      )}
    </>
  ) : null;
  return (
    <>
      <PageHeader
        returnLink={getVideoSubmissionsURL(getCourseId(), getVideoId())}
        title={intl.formatMessage(translations.videoTitle, {
          title: videoSubmission?.videoTitle,
        })}
      />
      {isLoading ? <LoadingIndicator /> : renderBody}
    </>
  );
};

export default injectIntl(VideoSubmissionShow);
