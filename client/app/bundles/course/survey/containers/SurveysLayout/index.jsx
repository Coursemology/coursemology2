import { Route, Switch, withRouter } from 'react-router-dom';

import QuestionFormDialogue from 'course/survey/containers/QuestionFormDialogue';
import SectionFormDialogue from 'course/survey/containers/SectionFormDialogue';
import SurveyFormDialogue from 'course/survey/containers/SurveyFormDialogue';
import SurveyLayout from 'course/survey/containers/SurveyLayout';
import SurveyIndex from 'course/survey/pages/SurveyIndex';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';
import NotificationPopup from 'lib/containers/NotificationPopup';

const SurveysLayout = () => {
  const surveyRoot = '/courses/:courseId/surveys';
  return (
    <>
      <SurveyFormDialogue />
      <QuestionFormDialogue />
      <SectionFormDialogue />
      <DeleteConfirmation />
      <NotificationPopup />

      <Switch>
        <Route component={SurveyIndex} exact={true} path={surveyRoot} />
        <Route component={SurveyLayout} path={`${surveyRoot}/:surveyId`} />
      </Switch>
    </>
  );
};

export default withRouter(SurveysLayout);
