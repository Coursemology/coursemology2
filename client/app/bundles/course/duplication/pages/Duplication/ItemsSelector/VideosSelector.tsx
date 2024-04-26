import { ListSubheader, Typography } from '@mui/material';
import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { Video, VideoTab } from 'course/duplication/types';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation, { MessageTranslator } from 'lib/hooks/useTranslation';
import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { AppDispatch } from 'store';

const { VIDEO_TAB, VIDEO } = duplicableItemTypes;

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.VideosSelector.noItems',
    defaultMessage: 'There are no videos to duplicate.',
  },
});

const setVideoAllInTab: (
  dispatch: AppDispatch,
  tab: VideoTab,
) => (value: boolean) => void = (dispatch, tab) => (value) => {
  dispatch(actions.setItemSelectedBoolean(VIDEO_TAB, tab.id, value));
  tab.videos.forEach((video) => {
    dispatch(actions.setItemSelectedBoolean(VIDEO, video.id, value));
  });
};

const setVideoTabAll: (
  dispatch: AppDispatch,
  tabs: VideoTab[],
) => (value: boolean) => void = (dispatch, tabs) => (value) => {
  tabs.forEach((tab) => setVideoAllInTab(dispatch, tab)(value));
};

interface VideoProps {
  dispatch: AppDispatch;
  selectedItems: Record<string, Record<number, boolean>>;
  video: Video;
}

const VideoComponent: FC<VideoProps> = (props) => {
  const { dispatch, selectedItems, video } = props;
  const checked = !!selectedItems[VIDEO][video.id];

  return (
    <IndentedCheckbox
      key={video.id}
      checked={checked}
      indentLevel={1}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={VIDEO} />
          {video.published || <UnpublishedIcon />}
          <Typography className="font-bold">{video.title}</Typography>
        </span>
      }
      onChange={(_, value) =>
        dispatch(actions.setItemSelectedBoolean(VIDEO, video.id, value))
      }
    />
  );
};

interface TabTreeProps {
  dispatch: AppDispatch;
  selectedItems: Record<string, Record<number, boolean>>;
  tab: VideoTab;
}

const TabTreeComponent: FC<TabTreeProps> = (props) => {
  const { dispatch, selectedItems, tab } = props;
  const { id, title, videos } = tab;
  const checked = !!selectedItems[VIDEO_TAB][id];

  return (
    <div key={id}>
      <IndentedCheckbox
        checked={checked}
        indentLevel={0}
        label={
          <span className="flex flex-row items-center">
            <TypeBadge itemType={VIDEO_TAB} />
            <Typography className="font-bold">{title}</Typography>
          </span>
        }
        onChange={(_, value) =>
          dispatch(actions.setItemSelectedBoolean(VIDEO_TAB, id, value))
        }
      >
        <BulkSelectors callback={setVideoAllInTab(dispatch, tab)} />
      </IndentedCheckbox>
      {videos.map((video) => (
        <VideoComponent
          dispatch={dispatch}
          selectedItems={selectedItems}
          video={video}
        />
      ))}
    </div>
  );
};

interface BodyProps {
  dispatch: AppDispatch;
  selectedItems: Record<string, Record<number, boolean>>;
  t: MessageTranslator;
  tabs: VideoTab[];
}

const VideoSelectorBody: FC<BodyProps> = (props) => {
  const { t, dispatch, selectedItems, tabs } = props;

  if (tabs.length < 1) {
    return (
      <ListSubheader disableSticky>{t(translations.noItems)}</ListSubheader>
    );
  }

  return (
    <>
      {tabs.length > 1 ? (
        <BulkSelectors
          callback={setVideoTabAll(dispatch, tabs)}
          selectLinkClassName="ml-0 leading-6"
        />
      ) : null}
      {tabs.map((tab) => (
        <TabTreeComponent
          dispatch={dispatch}
          selectedItems={selectedItems}
          tab={tab}
        />
      ))}
    </>
  );
};

const VideosSelector: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const duplication = useAppSelector(selectDuplicationStore);
  const { videosComponent: tabs, selectedItems } = duplication;

  if (!tabs) {
    return null;
  }

  return (
    <>
      <Typography className="mt-3 mb-1" variant="h6">
        {t(defaultComponentTitles.course_videos_component)}
      </Typography>
      <VideoSelectorBody
        dispatch={dispatch}
        selectedItems={selectedItems}
        t={t}
        tabs={tabs}
      />
    </>
  );
};

export default VideosSelector;
