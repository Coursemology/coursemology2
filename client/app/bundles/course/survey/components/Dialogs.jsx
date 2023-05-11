import QuestionFormDialogue from 'course/survey/containers/QuestionFormDialogue';
import SectionFormDialogue from 'course/survey/containers/SectionFormDialogue';
import SurveyFormDialogue from 'course/survey/containers/SurveyFormDialogue';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';

const Dialogs = () => (
  <>
    <SurveyFormDialogue />
    <QuestionFormDialogue />
    <SectionFormDialogue />
    <DeleteConfirmation />
  </>
);

export default Dialogs;
