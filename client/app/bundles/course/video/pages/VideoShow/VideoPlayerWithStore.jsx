import { memo } from 'react';
import equal from 'fast-deep-equal';
import PropTypes from 'prop-types';

import StoreProvider from 'lib/components/wrappers/StoreProvider';

import HeatMap from '../../submission/containers/Charts/HeatMap';
import VideoPlayer from '../../submission/containers/VideoPlayer';
import storeCreator from '../../submission/store';

import styles from '../../submission/containers/Statistics.scss';

const VideoPlayerWithStore = ({ video, statistics }) => (
  <StoreProvider {...storeCreator({ video })}>
    <>
      <div>
        <div className={styles.statisticsVideoView}>
          <VideoPlayer />
        </div>
      </div>
      <hr />
      <HeatMap {...statistics} />
    </>
  </StoreProvider>
);
VideoPlayerWithStore.propTypes = {
  video: PropTypes.object.isRequired,
  statistics: PropTypes.object.isRequired,
};

export default memo(VideoPlayerWithStore, (prevProps, nextProps) =>
  equal(prevProps, nextProps),
);
