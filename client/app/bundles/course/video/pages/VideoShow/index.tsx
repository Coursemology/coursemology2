import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader } from '@mui/material';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import { getVideosURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

import VideoManagementButtons from '../../components/buttons/VideoManagementButtons';
import WatchVideoButton from '../../components/buttons/WatchVideoButton';
import { loadVideo } from '../../operations';
import { getVideo } from '../../selectors';
import DescriptionCard from '../../submission/components/misc/DescriptionCard';

import VideoPlayerWithStore from './VideoPlayerWithStore';

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchVideoFailure: {
    id: 'course.video.show.failure',
    defaultMessage: 'Failed to retrieve video.',
  },
  video: {
    id: 'course.video.show.video',
    defaultMessage: 'Video',
  },
  videoTitle: {
    id: 'course.video.show.videoTitle',
    defaultMessage: 'Video - {title}',
  },
  statistics: {
    id: 'course.video.show.statistics',
    defaultMessage: 'Statistics',
  },
});

const VideoShow: FC<Props> = (props) => {
  const { intl } = props;
  const { videoId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const video = useSelector((state: AppState) => getVideo(state, +videoId!));

  useEffect(() => {
    if (videoId) {
      dispatch(loadVideo(+videoId))
        .catch(() =>
          toast.error(intl.formatMessage(translations.fetchVideoFailure)),
        )
        .finally(() => setIsLoading(false));
    }
  }, [dispatch, videoId]);

  if (isLoading) {
    return (
      <>
        <PageHeader title={intl.formatMessage(translations.video)} />
        <LoadingIndicator />
      </>
    );
  }

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
    <>
      <PageHeader
        returnLink={returnLink}
        title={intl.formatMessage(translations.videoTitle, {
          title: video?.title,
        })}
        toolbars={headerToolbars}
      />
      {isLoading ? <LoadingIndicator /> : renderBody}
    </>
  );
};

export default injectIntl(VideoShow);
