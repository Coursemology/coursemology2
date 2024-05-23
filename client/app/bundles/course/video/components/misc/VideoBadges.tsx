import { defineMessages } from 'react-intl';
import { FormatListBulleted } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { VideoListData, VideoMetadata } from 'types/course/videos';

import PersonalTimeBooleanIcon from 'lib/components/extensions/PersonalTimeBooleanIcon';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  for: VideoListData;
  metadata: VideoMetadata;
}

const translations = defineMessages({
  hasTodo: {
    id: 'course.video.VideoBadges.hasTodo',
    defaultMessage: 'Has TODO',
  },
});

const VideoBadges = (props: Props): JSX.Element => {
  const { for: video, metadata: videoMetadata } = props;
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-2 max-xl:mt-2 xl:ml-2">
      {video.hasTodo && (
        <Tooltip disableInteractive title={t(translations.hasTodo)}>
          <FormatListBulleted className="text-3xl text-neutral-500 hover?:text-neutral-600" />
        </Tooltip>
      )}
      <PersonalTimeBooleanIcon
        affectsPersonalTimes={video.affectsPersonalTimes}
        hasPersonalTimes={video.hasPersonalTimes}
        isStudent={videoMetadata.isStudent}
        timelineAlgorithm={videoMetadata.timelineAlgorithm}
      />
    </div>
  );
};

export default VideoBadges;
