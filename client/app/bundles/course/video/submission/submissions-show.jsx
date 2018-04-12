import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import ProgressGraph from './containers/Statistics/ProgressGraph';

$(document).ready(() => {
  const mountNode = document.getElementById('video-stats');

  if (!mountNode) { return; }

  const submissionData = mountNode.getAttribute('data');
  const initialState = JSON.parse(submissionData);

  render(
    <ProviderWrapper>
      <ProgressGraph {...initialState} />
    </ProviderWrapper>
    , mountNode
  );
});
