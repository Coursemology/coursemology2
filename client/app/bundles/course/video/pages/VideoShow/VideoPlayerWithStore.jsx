import PropTypes from 'prop-types';
import { memo } from 'react';
import equal from 'fast-deep-equal';
import { StoreProviderWrapper } from 'lib/components/ProviderWrapper';
import HeatMap from '../../submission/containers/Charts/HeatMap';
import storeCreator from '../../submission/store';
import styles from '../../submission/containers/Statistics.scss';
import VideoPlayer from '../../submission/containers/VideoPlayer';

const VideoPlayerWithStore = ({ video, statistics }) => (
  <StoreProviderWrapper {...storeCreator({ video })}>
    <>
      <div>
        <div className={styles.statisticsVideoView}>
          <VideoPlayer />
        </div>
      </div>
      <hr />
      <HeatMap {...statistics} />
    </>
  </StoreProviderWrapper>
);
VideoPlayerWithStore.propTypes = {
  video: PropTypes.object.isRequired,
  statistics: PropTypes.object.isRequired,
};

export default memo(VideoPlayerWithStore, (prevProps, nextProps) =>
  equal(prevProps, nextProps),
);
