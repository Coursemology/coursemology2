import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import HeatMap from './submission/containers/Charts/HeatMap';

$(document).ready(() => {
  const mountNode = document.getElementById('video-overall-stats');

  if (!mountNode) { return; }

  const submissionData = mountNode.getAttribute('data');
  const initialState = JSON.parse(submissionData);

  render(
    <ProviderWrapper>
      <HeatMap {...initialState} />
    </ProviderWrapper>,
    mountNode
  );
});
