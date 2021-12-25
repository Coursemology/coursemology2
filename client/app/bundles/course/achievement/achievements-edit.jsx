import { render } from 'react-dom';

import ProviderWrapper from 'lib/components/ProviderWrapper';

import AchievementEditPage from './pages/AchievementEdit';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('achievement-edit');
  if (mountNode) {
    const dataAttr = mountNode.getAttribute('data');
    const data = JSON.parse(dataAttr);
    const store = storeCreator({});

    const Page = () => (
      <ProviderWrapper store={store}>
        <AchievementEditPage
          conditionAttributes={data.condition_attributes}
          initialValues={{ ...data.attributes }}
        />
      </ProviderWrapper>
    );

    render(<Page />, mountNode);
  }
});
