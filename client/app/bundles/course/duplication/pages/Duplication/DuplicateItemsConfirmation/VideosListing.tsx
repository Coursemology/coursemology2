import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent, ListSubheader } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { selectDuplicationStore } from 'course/duplication/selectors';
import {
  DuplicationVideoData,
  DuplicationVideoTabData,
} from 'course/duplication/types';
import componentTranslations from 'course/translations';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  defaultTab: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.VideoListing.defaultTab',
    defaultMessage: 'Default Tab',
  },
});

const renderDuplicationVideoDataRow = (
  video: DuplicationVideoData,
): JSX.Element => (
  <IndentedCheckbox
    key={`video_${video.id}`}
    checked
    indentLevel={1}
    label={
      <span className="flex items-center">
        <TypeBadge itemType="VIDEO" />
        <UnpublishedIcon tooltipId="itemUnpublished" />
        {video.title}
      </span>
    }
  />
);

const renderTabRow = (tab: DuplicationVideoTabData): JSX.Element => (
  <IndentedCheckbox
    checked
    indentLevel={0}
    label={
      <span>
        <TypeBadge itemType="VIDEO_TAB" />
        {tab.title}
      </span>
    }
  />
);

const renderTab = (tab: DuplicationVideoTabData): JSX.Element => (
  <div key={`tab_video_${tab.id}`}>
    {renderTabRow(tab)}
    {tab.videos.map(renderDuplicationVideoDataRow)}
  </div>
);

const DuplicationVideoDatasListing: FC = () => {
  const { videosComponent: tabs, selectedItems } = useAppSelector(
    selectDuplicationStore,
  );
  const { t } = useTranslation();

  const tabTrees: DuplicationVideoTabData[] = [];
  const orphanedDuplicationVideoDatas: DuplicationVideoData[] = [];

  tabs.forEach((tab) => {
    const selectedDuplicationVideoDatas = tab.videos.filter(
      (v) => selectedItems.VIDEO[v.id],
    );
    if (selectedItems.VIDEO_TAB[tab.id]) {
      tabTrees.push({ ...tab, videos: selectedDuplicationVideoDatas });
    } else {
      orphanedDuplicationVideoDatas.push(...selectedDuplicationVideoDatas);
    }
  });

  if (tabTrees.length + orphanedDuplicationVideoDatas.length < 1) return null;

  return (
    <>
      <ListSubheader disableSticky>
        {t(componentTranslations.course_videos_component)}
      </ListSubheader>
      <Card>
        <CardContent>
          {tabTrees.map(renderTab)}
          <div key="video_default">
            {orphanedDuplicationVideoDatas.length > 0 && (
              <IndentedCheckbox
                disabled
                indentLevel={0}
                label={t(translations.defaultTab)}
              />
            )}
            {orphanedDuplicationVideoDatas.map(renderDuplicationVideoDataRow)}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DuplicationVideoDatasListing;
