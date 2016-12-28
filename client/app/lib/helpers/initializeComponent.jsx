import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';

const initializeComponent = (Component, nodeId, storeCreator) => {
  const renderComponent = (props) => {
    const store = storeCreator(props);

    render(
      <ProviderWrapper {...{ store }}>
        <Component />
      </ProviderWrapper>
    , document.getElementById(nodeId));
  };

  $.getJSON('', (data) => {
    $(document).ready(renderComponent(data));
  });
};

export default initializeComponent;
