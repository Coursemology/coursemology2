import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from './surveys/store';
import Surveys from './surveys/containers/Surveys';

const mountNode = document.getElementById('course-survey-component');

if (mountNode) {
  const data = JSON.parse(mountNode.getAttribute('data'));
  const store = storeCreator(data);

  $(document).ready(() => {
    render(
      <ProviderWrapper {...{ store }}>
        <Surveys />
      </ProviderWrapper>
    , mountNode);
  });
}
