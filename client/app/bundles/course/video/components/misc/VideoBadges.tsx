import { VideoListData, VideoMetadata } from 'types/course/videos';

import PersonalTimeBooleanIcon from 'lib/components/extensions/PersonalTimeBooleanIcon';

interface Props {
  for: VideoListData;
  metadata: VideoMetadata;
}

const VideoBadges = (props: Props): JSX.Element => {
  const { for: video, metadata: videoMetadata } = props;

  return (
    <div className="flex items-center space-x-2 max-xl:mt-2 xl:ml-2">
      <PersonalTimeBooleanIcon
        affectsPersonalTimes={video.affectsPersonalTimes}
        hasPersonalTimes={video.hasPersonalTimes}
      />

      {(videoMetadata.isCurrentCourseUser && !videoMetadata.isStudent) ||
        (videoMetadata.timelineAlgorithm &&
          videoMetadata.timelineAlgorithm !== 'fixed' && (
            <PersonalTimeBooleanIcon
              affectsPersonalTimes={video.affectsPersonalTimes}
              hasPersonalTimes={video.hasPersonalTimes}
            />
          ))}
    </div>
  );
};

export default VideoBadges;
