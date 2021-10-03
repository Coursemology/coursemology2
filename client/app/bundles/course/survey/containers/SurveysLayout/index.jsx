import { withRouter, Route, Switch } from 'react-router-dom';
import NotificationPopup from 'lib/containers/NotificationPopup';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';
import SurveyFormDialogue from 'course/survey/containers/SurveyFormDialogue';
import QuestionFormDialogue from 'course/survey/containers/QuestionFormDialogue';
import SectionFormDialogue from 'course/survey/containers/SectionFormDialogue';
import SurveyLayout from 'course/survey/containers/SurveyLayout';
import SurveyIndex from 'course/survey/pages/SurveyIndex';

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
        <Route exact path={surveyRoot} component={SurveyIndex} />
        <Route path={`${surveyRoot}/:surveyId`} component={SurveyLayout} />
      </Switch>
    </>
  );
};

export default withRouter(SurveysLayout);
