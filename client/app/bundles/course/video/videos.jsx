import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import HeatMap from './submission/containers/Charts/HeatMap';
import storeCreator from './submission/store';
import styles from './submission/containers/Statistics.scss';
import VideoPlayer from './submission/containers/VideoPlayer';

$(document).ready(() => {
  const mountNode = document.getElementById('video-overall-stats');

  if (!mountNode) {
    return;
  }

  const data = mountNode.getAttribute('data');
  const { statistics, video } = JSON.parse(data);

  render(
    <ProviderWrapper {...storeCreator({ video })}>
      <div>
        <div className={styles.statisticsVideoView}>
          <VideoPlayer />
        </div>
      </div>
      <hr />
      <HeatMap {...statistics} />
    </ProviderWrapper>,
    mountNode,
  );
});
