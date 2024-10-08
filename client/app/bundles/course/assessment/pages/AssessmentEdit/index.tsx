// import { fetchCodaveriSettingsForAssessment } from 'course/admin/pages/CodaveriSettings/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { getAssessmentId } from 'lib/helpers/url-helpers';

import { DEFAULT_MONITORING_OPTIONS } from '../../constants';
import { fetchAssessmentEditData } from '../../operations/assessments';
import translations from '../../translations';
import { categoryAndTabTitle } from '../../utils';

import AssessmentEditPage from './AssessmentEditPage';

const AssessmentEdit = (): JSX.Element => {
  const assessmentId = getAssessmentId();
  if (!assessmentId) {
    return <div />;
  }

  const parsedAssessmentId = parseInt(assessmentId, 10);

  return (
    <Preload
      render={<LoadingIndicator />}
      while={() =>
        Promise.all([
          fetchAssessmentEditData(parsedAssessmentId),
          // fetchCodaveriSettingsForAssessment(parsedAssessmentId),
        ])
      }
    >
      {([data]): JSX.Element => {
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
            canManageMonitor={data.can_manage_monitor}
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
              has_time_limit: !!data.attributes.time_limit,
              monitoring:
                data.attributes.monitoring ||
                (data.can_manage_monitor
                  ? DEFAULT_MONITORING_OPTIONS
                  : undefined),
            }}
            isKoditsuExamEnabled={data.isKoditsuExamEnabled}
            isQuestionsValidForKoditsu={data.isQuestionsValidForKoditsu}
            modeSwitching={data.mode_switching}
            monitoringEnabled={data.monitoring_component_enabled}
            pulsegridUrl={data.monitoring_url}
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

const handle = translations.edit;

export default Object.assign(AssessmentEdit, { handle });
