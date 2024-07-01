import { FC } from 'react';

import { VideoTab } from 'course/duplication/types';

import VideoRow from './VideoRow';
import VideoTabRow from './VideoTabRow';

interface TabProps {
  tab: VideoTab;
}

const Tab: FC<TabProps> = (props) => {
  const { tab } = props;

  return (
    <div key={`tab_video_${tab.id}`}>
      <VideoTabRow tab={tab} />
      {tab.videos.map((video) => (
        <VideoRow key={video.id} video={video} />
      ))}
    </div>
  );
};

export default Tab;
