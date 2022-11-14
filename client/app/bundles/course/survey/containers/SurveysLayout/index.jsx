import { Route, Routes } from 'react-router-dom';

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
      <Routes>
        <Route element={<SurveyIndex />} exact path={surveyRoot} />
        <Route element={<SurveyLayout />} path={`${surveyRoot}/:surveyId/*`} />
      </Routes>
    </>
  );
};

export default SurveysLayout;
