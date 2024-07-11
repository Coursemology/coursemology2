import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import AddButton from 'lib/components/core/buttons/AddButton';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import VideoTabs from '../../components/misc/VideoTabs';
import VideoTable from '../../components/tables/VideoTable';
import { fetchVideos, updatePublishedVideo } from '../../operations';
import {
  getAllVideos,
  getVideoMetadata,
  getVideoPermissions,
  getVideoTitle,
} from '../../selectors';
import VideoNew from '../VideoNew';

const translations = defineMessages({
  header: {
    id: 'course.video.VideosIndex.header',
    defaultMessage: 'Videos',
  },
  newVideo: {
    id: 'course.video.VideosIndex.newVideo',
    defaultMessage: 'New Video',
  },
  fetchVideosFailure: {
    id: 'course.video.VideosIndex.fetchVideosFailure',
    defaultMessage: 'Failed to retrieve videos.',
  },
  toggleSuccess: {
    id: 'course.video.VideosIndex.toggleSuccess',
    defaultMessage: 'Video was successfully updated.',
  },
  toggleFailure: {
    id: 'course.video.VideosIndex.toggleFailure',
    defaultMessage: 'Failed to update the video.',
  },
});

const VideosIndex: FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const videoMetadata = useAppSelector(getVideoMetadata);

  // Set the tab first.
  const [searchParams, setSearchParams] = useSearchParams();
  // when there is no tab params in the url, set the currentTabId as the tabId.
  const tabId = searchParams.get('tab')
    ? parseInt(searchParams.get('tab')!, 10)
    : videoMetadata.currentTabId;

  // When a video is edited and moved to another tab, we need to filter the updated videos
  // in the redux store.
  const videos = useAppSelector((state) => getAllVideos(state)).filter(
    (video) => video.tabId === tabId,
  );
  const videoTitle = useAppSelector(getVideoTitle);
  const videoPermissions = useAppSelector(getVideoPermissions);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchVideos(tabId))
      .finally(() => setIsLoading(false))
      .catch(() => toast.error(t(translations.fetchVideosFailure)));
  }, [dispatch, tabId]);

  const headerToolbars: ReactElement[] = [];

  if (videoPermissions?.canManage) {
    headerToolbars.push(
      <AddButton onClick={(): void => setIsOpen(true)}>
        {t(translations.newVideo)}
      </AddButton>,
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
    <Page
      actions={headerToolbars}
      title={videoTitle || t(translations.header)}
      unpadded
    >
      {!isLoading && isOpen && (
        <VideoNew
          currentTab={tabId}
          onClose={(): void => setIsOpen(false)}
          open={isOpen}
        />
      )}

      <VideoTabs currentTab={tabId} setCurrentTab={setSearchParams} />

      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <VideoTable
          onTogglePublished={onTogglePublished}
          permissions={videoPermissions}
          videos={videos}
        />
      )}
    </Page>
  );
};

export default VideosIndex;
