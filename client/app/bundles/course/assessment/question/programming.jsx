import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import store from './programming/store';
import ProgrammingQuestion from './programming/ProgrammingQuestion';

$(document).ready(() => {
  const mountNode = document.getElementById('programming-question');
  if (mountNode) {
    const Page = () => (
      <ProviderWrapper {...{ store }}>
        <ProgrammingQuestion />
      </ProviderWrapper>
    );

    render(
      <Page />,
      mountNode
    );
  }
});
