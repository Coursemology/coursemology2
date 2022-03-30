import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from './store';
import AssessmentIndexPage from './pages/AssessmentIndex';

$(() => {
  const mountNode = $('.new-btn')[0];

  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const attributes = JSON.parse(data);
    const store = storeCreator({ assessments: {} });
    const Page = () => (
      <ProviderWrapper store={store}>
        <AssessmentIndexPage
          gamified={attributes.gamified}
          randomizationAllowed={attributes.randomization_allowed}
          categoryId={attributes.category_id}
          tabId={attributes.tab_id}
        />
      </ProviderWrapper>
    );

    render(<Page />, mountNode);
  }
});
