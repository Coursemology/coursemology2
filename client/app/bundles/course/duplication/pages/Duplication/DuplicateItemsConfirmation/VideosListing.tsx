import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent, ListSubheader, Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { Video, VideoTab } from 'course/duplication/types';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const { VIDEO_TAB, VIDEO } = duplicableItemTypes;

const translations = defineMessages({
  defaultTab: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.VideoListing.defaultTab',
    defaultMessage: 'Default Tab',
  },
});

const DefaultVideoTabRow: FC = () => {
  const { t } = useTranslation();
  return (
    <IndentedCheckbox
      disabled
      indentLevel={0}
      label={
        <Typography className="font-bold">
          {t(translations.defaultTab)}
        </Typography>
      }
    />
  );
};

interface TabRowProps {
  tab: VideoTab;
}

const TabRow: FC<TabRowProps> = (props) => {
  const { tab } = props;

  return (
    <IndentedCheckbox
      checked
      indentLevel={0}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={VIDEO_TAB} />
          <Typography className="font-bold">{tab.title}</Typography>
        </span>
      }
    />
  );
};

interface VideoRowProps {
  video: Video;
}

const VideoRow: FC<VideoRowProps> = (props) => {
  const { video } = props;

  return (
    <IndentedCheckbox
      key={`video_${video.id}`}
      checked
      indentLevel={1}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={VIDEO} />
          <UnpublishedIcon tooltipId="itemUnpublished" />
          <Typography className="font-bold">{video.title}</Typography>
        </span>
      }
    />
  );
};

interface TabProps {
  tab: VideoTab;
}

const TabComponent: FC<TabProps> = (props) => {
  const { tab } = props;

  return (
    <div key={`tab_video_${tab.id}`}>
      <TabRow tab={tab} />
      {tab.videos.map((video) => (
        <VideoRow key={video.id} video={video} />
      ))}
    </div>
  );
};

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
            <TabComponent key={tab.id} tab={tab} />
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
