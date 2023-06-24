import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader } from '@mui/material';

import DescriptionCard from 'lib/components/core/DescriptionCard';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { getVideosURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import VideoManagementButtons from '../../components/buttons/VideoManagementButtons';
import WatchVideoButton from '../../components/buttons/WatchVideoButton';
import { loadVideo } from '../../operations';
import { getVideo } from '../../selectors';

import VideoDetails from './VideoDetails';
import VideoPlayerWithStore from './VideoPlayerWithStore';

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchVideoFailure: {
    id: 'course.video.VideoShow.fetchVideoFailure',
    defaultMessage: 'Failed to retrieve video.',
  },
  video: {
    id: 'course.video.VideoShow.video',
    defaultMessage: 'Video',
  },
  videoTitle: {
    id: 'course.video.VideoShow.videoTitle',
    defaultMessage: 'Video - {title}',
  },
  statistics: {
    id: 'course.video.VideoShow.statistics',
    defaultMessage: 'Statistics',
  },
});

const VideoShow: FC<Props> = (props) => {
  const { intl } = props;
  const { videoId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const video = useAppSelector((state) => getVideo(state, +videoId!));

  useEffect(() => {
    if (videoId) {
      dispatch(loadVideo(+videoId))
        .catch(() =>
          toast.error(intl.formatMessage(translations.fetchVideoFailure)),
        )
        .finally(() => setIsLoading(false));
    }
  }, [dispatch, videoId]);

  if (isLoading) return <LoadingIndicator />;

  const headerToolbars: ReactElement[] = [];

  if (video?.permissions?.canAttempt) {
    headerToolbars.push(<WatchVideoButton video={video} />);
  }

  if (video?.permissions?.canManage) {
    headerToolbars.push(
      <VideoManagementButtons navigateToIndex video={video} />,
    );
  }

  const renderBody = video ? (
    <>
      {video.description && <DescriptionCard description={video.description} />}
      <VideoDetails for={video} />
      {video.permissions.canManage && (
        <Card className="mt-6">
          <CardHeader title={intl.formatMessage(translations.statistics)} />
          <CardContent>
            <VideoPlayerWithStore
              statistics={video.videoStatistics.statistics}
              video={video.videoStatistics.video}
            />
          </CardContent>
        </Card>
      )}
    </>
  ) : null;

  const returnLink = video?.tabId
    ? `${getVideosURL(getCourseId())}?tab=${video.tabId}`
    : getVideosURL(getCourseId());

  return (
    <Page
      actions={headerToolbars}
      backTo={returnLink}
      className="space-y-5"
      title={intl.formatMessage(translations.videoTitle, {
        title: video?.title,
      })}
    >
      {isLoading ? <LoadingIndicator /> : renderBody}
    </Page>
  );
};

export default injectIntl(VideoShow);
