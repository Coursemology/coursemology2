import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import CourseAPI from 'api/course';
import Submission from './containers/Submission';
import storeCreator from './store';

function renderSubmission(state, node) {
  render(
    <ProviderWrapper {...storeCreator(state)}>
      <Submission />
    </ProviderWrapper>,
    node
  );
}

$(document).ready(() => {
  const mountNode = document.getElementById('video-component');

  if (!mountNode) { return; }

  const submissionData = mountNode.getAttribute('data');
  const initialState = JSON.parse(submissionData);
  const { enableMonitoring } = initialState;
  if (enableMonitoring) {
    render(
      <ProviderWrapper>
        <LoadingIndicator />
      </ProviderWrapper>,
      mountNode
    );

    CourseAPI.video.sessions.create()
      .then(({ data }) => {
        initialState.video.sessionId = data.id;
        renderSubmission(initialState, mountNode);
      })
      .catch(() => {
        renderSubmission(initialState, mountNode);
      });
  } else {
    renderSubmission(initialState, mountNode);
  }
});
