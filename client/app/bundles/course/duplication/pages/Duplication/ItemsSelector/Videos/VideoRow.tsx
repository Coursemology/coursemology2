import { FC } from 'react';
import { Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { Video } from 'course/duplication/types';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

interface VideoRowProps {
  video: Video;
}

const VideoRow: FC<VideoRowProps> = (props) => {
  const dispatch = useAppDispatch();
  const duplication = useAppSelector(selectDuplicationStore);

  const { selectedItems } = duplication;
  const { video } = props;
  const checked = !!selectedItems[duplicableItemTypes.VIDEO][video.id];

  return (
    <IndentedCheckbox
      key={video.id}
      checked={checked}
      indentLevel={1}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={duplicableItemTypes.VIDEO} />
          {video.published || <UnpublishedIcon />}
          <Typography className="font-bold">{video.title}</Typography>
        </span>
      }
      onChange={(_, value) =>
        dispatch(
          actions.setItemSelectedBoolean(
            duplicableItemTypes.VIDEO,
            video.id,
            value,
          ),
        )
      }
    />
  );
};

export default VideoRow;
