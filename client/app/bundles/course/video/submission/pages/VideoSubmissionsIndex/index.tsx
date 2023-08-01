import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { VideoSubmission } from 'types/course/video/submissions';

import CourseAPI from 'api/course';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import { getVideosURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import toast from 'lib/hooks/toast';

import VideoSubmissionsTable from '../../components/tables/VideoSubmissionsTable';

type Props = WrappedComponentProps;

const translations = defineMessages({
  noVideoSubmission: {
    id: 'course.video.submission.VideoSubmissionsIndex.noVideoSubmission',
    defaultMessage: 'There is currently no video submission.',
  },
  fetchVideoSubmissionsFailure: {
    id: 'course.video.submission.VideoSubmissionsIndex.fetchVideoSubmissionsFailure',
    defaultMessage: 'Failed to retrieve video submissions.',
  },
  myStudents: {
    id: 'course.video.submission.VideoSubmissionsIndex.myStudents',
    defaultMessage: 'My Students',
  },
  normalStudents: {
    id: 'course.video.submission.VideoSubmissionsIndex.normalStudents',
    defaultMessage: 'Normal Students',
  },
  phantomStudents: {
    id: 'course.video.submission.VideoSubmissionsIndex.phantomStudents',
    defaultMessage: 'Phantom Students',
  },
  submissions: {
    id: 'course.video.submission.VideoSubmissionsIndex.submissions',
    defaultMessage: 'Submissions',
  },
});

const VideoSubmissionsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<VideoSubmission>();

  useEffect(() => {
    CourseAPI.video.submissions
      .index()
      .then((response) => {
        setData(response.data);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error(
          intl.formatMessage(translations.fetchVideoSubmissionsFailure),
        );
        setIsLoading(false);
      });
  }, []);

  const returnLink = data?.videoTabId
    ? `${getVideosURL(getCourseId())}?tab=${data?.videoTabId}`
    : getVideosURL(getCourseId());

  return (
    <Page
      backTo={returnLink}
      title={`${intl.formatMessage({
        id: 'course.video.submissions.VideoSubmissionsIndex.header',
        defaultMessage: 'Video Submissions',
      })} ${data?.videoTitle ? `- ${data.videoTitle}` : ''}`}
      unpadded
    >
      {data &&
        data.myStudentSubmissions.length === 0 &&
        data.studentSubmissions.length === 0 &&
        data.phantomStudentSubmissions.length === 0 && (
          <Note message={intl.formatMessage(translations.noVideoSubmission)} />
        )}
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          {data?.myStudentSubmissions &&
            data?.myStudentSubmissions.length > 0 && (
              <VideoSubmissionsTable
                title={intl.formatMessage(translations.myStudents)}
                videoSubmissions={data.myStudentSubmissions}
              />
            )}
          {data?.studentSubmissions && data?.studentSubmissions.length > 0 && (
            <VideoSubmissionsTable
              title={intl.formatMessage(translations.normalStudents)}
              videoSubmissions={data.studentSubmissions}
            />
          )}
          {data?.phantomStudentSubmissions &&
            data?.phantomStudentSubmissions.length > 0 && (
              <VideoSubmissionsTable
                title={intl.formatMessage(translations.phantomStudents)}
                videoSubmissions={data.phantomStudentSubmissions}
              />
            )}
        </>
      )}
    </Page>
  );
};

const handle = translations.submissions;

export default Object.assign(injectIntl(VideoSubmissionsIndex), { handle });
