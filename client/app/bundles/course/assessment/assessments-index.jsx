import { render } from 'react-dom';

import ProviderWrapper from 'lib/components/ProviderWrapper';

import AssessmentIndexPage from './pages/AssessmentIndex';
import storeCreator from './store';

$(() => {
  const mountNode = $('.new-btn')[0];

  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const attributes = JSON.parse(data);
    const store = storeCreator({ assessments: {} });
    const Page = () => (
      <ProviderWrapper store={store}>
        <AssessmentIndexPage
          categoryId={attributes.category_id}
          gamified={attributes.gamified}
          randomizationAllowed={attributes.randomization_allowed}
          tabId={attributes.tab_id}
        />
      </ProviderWrapper>
    );

    render(<Page />, mountNode);
  }
});
