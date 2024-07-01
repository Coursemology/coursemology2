import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { Video } from 'course/duplication/types';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  defaultTab: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.VideoListing.defaultTab',
    defaultMessage: 'Default Tab',
  },
});

interface VideoRowProps {
  video: Video;
}

export const DefaultVideoTabRow: FC = () => {
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

const VideoRow: FC<VideoRowProps> = (props) => {
  const { video } = props;

  return (
    <IndentedCheckbox
      key={`video_${video.id}`}
      checked
      indentLevel={1}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={duplicableItemTypes.VIDEO} />
          <UnpublishedIcon tooltipId="itemUnpublished" />
          <Typography className="font-bold">{video.title}</Typography>
        </span>
      }
    />
  );
};

export default VideoRow;
