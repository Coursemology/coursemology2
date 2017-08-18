import AssessmentsAPI from './Assessments';
import CategoriesAPI from './Categories';
import SubmissionsAPI from './Submissions';
import SubmissionQuestionsAPI from './SubmissionQuestions';

const AssessmentAPI = {
  assessments: new AssessmentsAPI(),
  categories: new CategoriesAPI(),
  submissions: new SubmissionsAPI(),
  submissionQuestions: new SubmissionQuestionsAPI(),
};

Object.freeze(AssessmentAPI);

export default AssessmentAPI;
