import { createRoot } from 'react-dom/client';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import { getAssessmentId } from 'lib/helpers/url-helpers';

import AssessmentEditPage from './pages/AssessmentEdit';
import { fetchAssessmentEditData } from './actions';
import storeCreator from './store';
import { categoryAndTabTitle } from './utils';

$(async () => {
  const mountNode = document.getElementById('assessment-edit');
  if (mountNode) {
    const store = storeCreator({});

    const data = await fetchAssessmentEditData(getAssessmentId());

    const tabAttr = data.tab_attributes;
    const currentTab = {
      tab_id: data.attributes.tab_id,
      title: categoryAndTabTitle(
        tabAttr.category_title,
        tabAttr.tab_title,
        tabAttr.only_tab,
      ),
    };

    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <AssessmentEditPage
          conditionAttributes={data.conditionsData}
          containsCodaveri={data.contains_codaveri}
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
      </ProviderWrapper>,
    );
  }
});
