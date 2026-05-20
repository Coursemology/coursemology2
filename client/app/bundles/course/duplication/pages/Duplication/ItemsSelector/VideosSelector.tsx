import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { ListSubheader, Typography } from '@mui/material';

import BulkSelectors from 'course/duplication/components/BulkSelectors';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { selectDuplicationStore } from 'course/duplication/selectors';
import { actions } from 'course/duplication/store';
import {
  DuplicationVideoData,
  DuplicationVideoTabData,
} from 'course/duplication/types';
import componentTranslations from 'course/translations';
import IndentedCheckbox from 'lib/components/core/IndentedCheckbox';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.VideosSelector.noItems',
    defaultMessage: 'There are no videos to duplicate.',
  },
});

const VideosSelector: FC = () => {
  const { videosComponent: tabs, selectedItems } = useAppSelector(
    selectDuplicationStore,
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  if (!tabs) return null;

  const setAllInTab =
    (tab: DuplicationVideoTabData) =>
    (value: boolean): void => {
      dispatch(actions.setItemSelectedBoolean('VIDEO_TAB', tab.id, value));
      tab.videos.forEach((video) => {
        dispatch(actions.setItemSelectedBoolean('VIDEO', video.id, value));
      });
    };

  const setEverything = (value: boolean): void => {
    tabs.forEach((tab) => setAllInTab(tab)(value));
  };

  const renderVideo = (video: DuplicationVideoData): JSX.Element => {
    const checked = !!selectedItems.VIDEO[video.id];
    return (
      <IndentedCheckbox
        key={video.id}
        checked={checked}
        indentLevel={1}
        label={
          <span className="flex items-center">
            <TypeBadge itemType="VIDEO" />
            {video.published || <UnpublishedIcon />}
            {video.title}
          </span>
        }
        onChange={(_, value) =>
          dispatch(actions.setItemSelectedBoolean('VIDEO', video.id, value))
        }
      />
    );
  };

  const renderTabTree = (tab: DuplicationVideoTabData): JSX.Element => {
    const { id, title, videos } = tab;
    const checked = !!selectedItems.VIDEO_TAB[id];
    return (
      <div key={id}>
        <IndentedCheckbox
          checked={checked}
          indentLevel={0}
          label={
            <span>
              <TypeBadge itemType="VIDEO_TAB" />
              {title}
            </span>
          }
          onChange={(_, value) =>
            dispatch(actions.setItemSelectedBoolean('VIDEO_TAB', id, value))
          }
        >
          <BulkSelectors callback={setAllInTab(tab)} />
        </IndentedCheckbox>
        {videos.map(renderVideo)}
      </div>
    );
  };

  const renderBody = (): JSX.Element => {
    if (tabs.length < 1) {
      return (
        <ListSubheader disableSticky>{t(translations.noItems)}</ListSubheader>
      );
    }
    return (
      <>
        {tabs.length > 1 && (
          <BulkSelectors
            callback={setEverything}
            styles={{ selectLink: { marginLeft: 0 } }}
          />
        )}
        {tabs.map(renderTabTree)}
      </>
    );
  };

  return (
    <>
      <Typography className="mt-5 mb-5" variant="h2">
        {t(componentTranslations.course_videos_component)}
      </Typography>
      {renderBody()}
    </>
  );
};

export default VideosSelector;
