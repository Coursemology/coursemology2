import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from './store';
import EditPage from './pages/EditPage';

const mountNode = document.getElementById('assessment-edit');
if (mountNode) {
  const dataAttr = mountNode.getAttribute('data');
  const data = JSON.parse(dataAttr);
  const store = storeCreator({});

  const Page = () => (
    <ProviderWrapper store={store}>
      <EditPage
        modeSwitching={data.mode_switching}
        folderAttributes={data.folder_attributes}
        conditionAttributes={data.condition_attributes}
        initialValues={{ ...data.attributes, password_protected: !!data.attributes.password }}
      />
    </ProviderWrapper>
  );

  $(document).ready(() => {
    render(
      <Page />,
      mountNode
    );
  });
}
