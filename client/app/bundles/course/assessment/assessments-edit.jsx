import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import { getAssessmentId } from 'lib/helpers/url-helpers';
import storeCreator from './store';
import AssessmentEditPage from './pages/AssessmentEdit';
import { categoryAndTabTitle } from './utils';
import { fetchAssessmentEditData } from './actions';

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

    const Page = () => (
      <ProviderWrapper store={store}>
        <AssessmentEditPage
          modeSwitching={data.mode_switching}
          containsCodaveri={data.contains_codaveri}
          gamified={data.gamified}
          showPersonalizedTimelineFeatures={
            data.show_personalized_timeline_features
          }
          randomizationAllowed={data.randomization_allowed}
          folderAttributes={data.folder_attributes}
          conditionAttributes={data.conditionsData}
          initialValues={{
            ...data.attributes,
            tabs: [currentTab],
            password_protected: !!(
              data.attributes.view_password || data.attributes.session_password
            ),
          }}
        />
      </ProviderWrapper>
    );

    render(<Page />, mountNode);
  }
});
