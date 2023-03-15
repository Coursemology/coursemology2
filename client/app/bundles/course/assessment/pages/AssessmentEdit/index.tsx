import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { getAssessmentId } from 'lib/helpers/url-helpers';

import { fetchAssessmentEditData } from '../../actions';
import { categoryAndTabTitle } from '../../utils';

import AssessmentEditPage from './AssessmentEditPage';

const AssessmentEdit = (): JSX.Element => {
  return (
    <Preload
      render={<LoadingIndicator />}
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      while={() => fetchAssessmentEditData(getAssessmentId())}
    >
      {(data): JSX.Element => {
        const tabAttr = data.tab_attributes;
        const currentTab = {
          tab_id: data.attributes.tab_id,
          title: categoryAndTabTitle(
            tabAttr.category_title,
            tabAttr.tab_title,
            tabAttr.only_tab,
          ),
        };

        return (
          <AssessmentEditPage
            // @ts-ignore: component is still written in JSX
            conditionAttributes={data.conditionsData}
            folderAttributes={data.folder_attributes}
            gamified={data.gamified}
            initialValues={{
              ...data.attributes,
              tabs: [currentTab],
              password_protected: !!(
                data.attributes.view_password ||
                data.attributes.session_password
              ),
            }}
            modeSwitching={data.mode_switching}
            randomizationAllowed={data.randomization_allowed}
            showPersonalizedTimelineFeatures={
              data.show_personalized_timeline_features
            }
          />
        );
      }}
    </Preload>
  );
};

export default AssessmentEdit;
