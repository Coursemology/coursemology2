import { FC } from 'react';
import { Typography } from '@mui/material';
import { AppDispatch } from 'store';

import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { VideoTab } from 'course/duplication/types';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import VideoRow from './VideoRow';

interface VideoTabTreeProps {
  tab: VideoTab;
}

export const setVideoAllInTab: (
  dispatch: AppDispatch,
  tab: VideoTab,
) => (value: boolean) => void = (dispatch, tab) => (value) => {
  dispatch(
    actions.setItemSelectedBoolean(
      duplicableItemTypes.VIDEO_TAB,
      tab.id,
      value,
    ),
  );
  tab.videos.forEach((video) => {
    dispatch(
      actions.setItemSelectedBoolean(
        duplicableItemTypes.VIDEO,
        video.id,
        value,
      ),
    );
  });
};

const VideoTabTree: FC<VideoTabTreeProps> = (props) => {
  const dispatch = useAppDispatch();
  const duplication = useAppSelector(selectDuplicationStore);

  const { selectedItems } = duplication;
  const { tab } = props;
  const { id, title, videos } = tab;
  const checked = !!selectedItems[duplicableItemTypes.VIDEO_TAB][id];

  return (
    <div key={id}>
      <IndentedCheckbox
        checked={checked}
        indentLevel={0}
        label={
          <span className="flex flex-row items-center">
            <TypeBadge itemType={duplicableItemTypes.VIDEO_TAB} />
            <Typography className="font-bold">{title}</Typography>
          </span>
        }
        onChange={(_, value) =>
          dispatch(
            actions.setItemSelectedBoolean(
              duplicableItemTypes.VIDEO_TAB,
              id,
              value,
            ),
          )
        }
      >
        <BulkSelectors callback={setVideoAllInTab(dispatch, tab)} />
      </IndentedCheckbox>
      {videos.map((video) => (
        <VideoRow key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoTabTree;
