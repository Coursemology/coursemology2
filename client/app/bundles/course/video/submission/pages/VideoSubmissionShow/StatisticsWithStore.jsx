import { memo } from 'react';
import equal from 'fast-deep-equal';
import PropTypes from 'prop-types';

import StoreProvider from 'lib/components/wrappers/StoreProvider';

import Statistics from '../../containers/Statistics';
import VideoPlayer from '../../containers/VideoPlayer';
import storeCreator from '../../store';

import styles from '../../containers/Statistics.scss';

const StatisticsWithStore = ({ video, statistics }) => (
  <StoreProvider {...storeCreator({ video })}>
    <div>
      <div className={styles.statisticsVideoView}>
        <VideoPlayer />
      </div>
      <hr />
      <Statistics {...statistics} />
    </div>
  </StoreProvider>
);
StatisticsWithStore.propTypes = {
  video: PropTypes.object.isRequired,
  statistics: PropTypes.object.isRequired,
};

export default memo(StatisticsWithStore, (prevProps, nextProps) =>
  equal(prevProps, nextProps),
);
