import React from 'react';
import { render } from 'react-dom';
import Immutable from 'immutable';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import MaterialListContainer from './containers/MaterialListContainer';

const mountNode = document.getElementById('uploaded-files');
if (mountNode) {
  const data = mountNode.getAttribute('data');
  const materials = Immutable.fromJS(JSON.parse(data));

  const Page = () => (
    <ProviderWrapper>
      <MaterialListContainer materials={materials} />
    </ProviderWrapper>
  );

  $(document).ready(() => {
    render(
      <Page />,
      mountNode
    );
  });
}
