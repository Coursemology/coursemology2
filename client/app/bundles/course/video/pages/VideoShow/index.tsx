import PageHeader from 'lib/components/navigation/PageHeader';
import { getCourseId } from 'lib/helpers/url-helpers';
import { Card, CardContent, CardHeader } from '@mui/material';
import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { getVideosURL } from 'lib/helpers/url-builders';
import { loadVideo } from '../../operations';
import VideoPlayerWithStore from './VideoPlayerWithStore';
import VideoManagementButtons from '../../components/buttons/VideoManagementButtons';
import { getVideo } from '../../selectors';
import DescriptionCard from '../../submission/components/misc/DescriptionCard';
import WatchVideoButton from '../../components/buttons/WatchVideoButton';

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
      <VideoManagementButtons video={video} navigateToIndex />,
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
              video={video.videoStatistics.video}
              statistics={video.videoStatistics.statistics}
            />
          </CardContent>
        </Card>
      )}
    </>
  ) : (
    <></>
  );
  const returnLink = video?.tabId
    ? `${getVideosURL(getCourseId())}?tab=${video.tabId}`
    : getVideosURL(getCourseId());
  return (
    <>
      <PageHeader
        title={`Video - ${video?.title}`}
        returnLink={returnLink}
        toolbars={headerToolbars}
      />
      {isLoading ? <LoadingIndicator /> : renderBody}
    </>
  );
};

export default injectIntl(VideoShow);
