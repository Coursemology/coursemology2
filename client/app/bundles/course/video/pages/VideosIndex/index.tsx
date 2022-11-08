import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import PageHeader from 'lib/components/navigation/PageHeader';
import useTranslation from 'lib/hooks/useTranslation';
import { fetchVideos, updatePublishedVideo } from '../../operations';
import {
  getVideoPermissions,
  getAllVideos,
  getVideoMetadata,
} from '../../selectors';
import VideoTable from '../../components/tables/VideoTable';
import VideoNew from '../VideoNew';
import VideoTabs from '../../components/misc/VideoTabs';

const translations = defineMessages({
  newVideo: {
    id: 'course.video.index.newVideo',
    defaultMessage: 'New Video',
  },
  fetchVideosFailure: {
    id: 'course.video.index.fetch.failure',
    defaultMessage: 'Failed to retrieve videos.',
  },
  toggleSuccess: {
    id: 'course.video.toggle.success',
    defaultMessage: 'Video was successfully updated.',
  },
  toggleFailure: {
    id: 'course.video.toggle.fail',
    defaultMessage: 'Failed to update the video.',
  },
});

const VideosIndex: FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const videoMetadata = useSelector((state: AppState) =>
    getVideoMetadata(state),
  );

  // Set the tab first.
  const [searchParams, setSearchParams] = useSearchParams();
  // when there is no tab params in the url, set the currentTabId as the tabId.
  const tabId = searchParams.get('tab')
    ? parseInt(searchParams.get('tab')!, 10)
    : videoMetadata.currentTabId;

  // When a video is edited and moved to another tab, we need to filter the updated videos
  // in the redux store.
  const videos = useSelector((state: AppState) => getAllVideos(state)).filter(
    (video) => video.tabId === tabId,
  );
  const videoPermissions = useSelector((state: AppState) =>
    getVideoPermissions(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchVideos(tabId))
      .finally(() => setIsLoading(false))
      .catch(() => toast.error(t(translations.fetchVideosFailure)));
  }, [dispatch, tabId]);

  const headerToolbars: ReactElement[] = [];

  if (videoPermissions?.canManage) {
    headerToolbars.push(
      <Button
        className="new-video-button bg-white"
        key="new-video-button"
        variant="outlined"
        color="primary"
        onClick={(): void => setIsOpen(true)}
      >
        {t(translations.newVideo)}
      </Button>,
    );
  }

  const onTogglePublished = (videoId: number, data: boolean): Promise<void> =>
    dispatch(updatePublishedVideo(videoId, data))
      .then(() => {
        toast.success(t(translations.toggleSuccess));
      })
      .catch(() => {
        toast.error(t(translations.toggleFailure));
      });

  return (
    <>
      <PageHeader
        title={t({
          id: 'course.video.header',
          defaultMessage: 'Videos',
        })}
        toolbars={headerToolbars}
      />
      {!isLoading && isOpen && (
        <VideoNew
          open={isOpen}
          onClose={(): void => setIsOpen(false)}
          currentTab={tabId}
        />
      )}
      <VideoTabs currentTab={tabId} setCurrentTab={setSearchParams} />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <VideoTable
          videos={videos}
          permissions={videoPermissions}
          onTogglePublished={onTogglePublished}
        />
      )}
    </>
  );
};

export default VideosIndex;
