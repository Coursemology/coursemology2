import { FC } from 'react';
import { Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { duplicableItemTypes } from 'course/duplication/constants';
import { VideoTab } from 'course/duplication/types';

interface TabRowProps {
  tab: VideoTab;
}

const VideoTabRow: FC<TabRowProps> = (props) => {
  const { tab } = props;

  return (
    <IndentedCheckbox
      checked
      indentLevel={0}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={duplicableItemTypes.VIDEO_TAB} />
          <Typography className="font-bold">{tab.title}</Typography>
        </span>
      }
    />
  );
};

export default VideoTabRow;
