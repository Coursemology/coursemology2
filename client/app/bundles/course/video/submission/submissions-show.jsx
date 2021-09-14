import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import Statistics from './containers/Statistics';
import VideoPlayer from './containers/VideoPlayer';
import storeCreator from './store';
import styles from './containers/Statistics.scss';

$(document).ready(() => {
  const mountNode = document.getElementById('video-stats');

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
        <hr />
        <Statistics {...statistics} />
      </div>
    </ProviderWrapper>,
    mountNode
  );
});
