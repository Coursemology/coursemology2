import { FC } from 'react';
import { Card, CardContent, ListSubheader } from '@mui/material';

import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { Video, VideoTab } from 'course/duplication/types';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import Tab from './Tab';
import VideoRow, { DefaultVideoTabRow } from './VideoRow';

const { VIDEO_TAB, VIDEO } = duplicableItemTypes;

const selectedSubtrees: (
  tabs: VideoTab[],
  selectedItems: Record<string, Record<number, boolean>>,
) => [VideoTab[], Video[]] = (tabs, selectedItems) => {
  const tabTrees: VideoTab[] = [];
  const orphanedVideos: Video[] = [];

  tabs.forEach((tab) => {
    const selectedVideos = tab.videos.filter(
      (video) => selectedItems[VIDEO][video.id],
    );

    if (selectedItems[VIDEO_TAB][tab.id]) {
      tabTrees.push({ ...tab, videos: selectedVideos });
    } else {
      orphanedVideos.push(...selectedVideos);
    }
  });

  return [tabTrees, orphanedVideos];
};

const VideosListing: FC = () => {
  const { t } = useTranslation();
  const duplication = useAppSelector(selectDuplicationStore);

  const { videosComponent: tabs, selectedItems } = duplication;
  const [tabTrees, orphanedVideos] = selectedSubtrees(tabs, selectedItems);

  if (tabTrees.length + orphanedVideos.length < 1) {
    return null;
  }

  return (
    <>
      <ListSubheader disableSticky>
        {t(defaultComponentTitles.course_videos_component)}
      </ListSubheader>
      <Card>
        <CardContent>
          {tabTrees.map((tab) => (
            <Tab key={tab.id} tab={tab} />
          ))}
          <div key="video_default">
            {orphanedVideos.length > 0 && <DefaultVideoTabRow />}
            {orphanedVideos.map((video) => (
              <VideoRow key={video.id} video={video} />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default VideosListing;
