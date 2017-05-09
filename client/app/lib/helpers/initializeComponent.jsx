import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
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

  const params = { format: 'json' };
  axios.get('', { params }).then((response) => {
    $(document).ready(() => { renderComponent(response.data); });
  });
};

export default initializeComponent;
