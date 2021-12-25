import { render } from 'react-dom';

import ProviderWrapper from 'lib/components/ProviderWrapper';

import AssessmentEditPage from './pages/AssessmentEdit';
import storeCreator from './store';
import { categoryAndTabTitle } from './utils';

$(() => {
  const mountNode = document.getElementById('assessment-edit');
  if (mountNode) {
    const dataAttr = mountNode.getAttribute('data');
    const data = JSON.parse(dataAttr);
    const store = storeCreator({});
    const tabAttr = data.tab_attributes;
    const currentTab = {
      tab_id: data.attributes.tab_id,
      title: categoryAndTabTitle(
        tabAttr.category_title,
        tabAttr.tab_title,
        tabAttr.only_tab,
      ),
    };

    const Page = () => (
      <ProviderWrapper store={store}>
        <AssessmentEditPage
          conditionAttributes={data.condition_attributes}
          folderAttributes={data.folder_attributes}
          gamified={data.gamified}
          initialValues={{
            ...data.attributes,
            tabs: [currentTab],
            password_protected: !!(
              data.attributes.view_password || data.attributes.session_password
            ),
          }}
          modeSwitching={data.mode_switching}
          randomizationAllowed={data.randomization_allowed}
          showPersonalizedTimelineFeatures={
            data.show_personalized_timeline_features
          }
        />
      </ProviderWrapper>
    );

    render(<Page />, mountNode);
  }
});
