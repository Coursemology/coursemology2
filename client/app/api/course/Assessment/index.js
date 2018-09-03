import AssessmentsAPI from './Assessments';
import CategoriesAPI from './Categories';
import SubmissionsAPI from './Submissions';
import SubmissionQuestionsAPI from './SubmissionQuestions';
import AnswerAPI from './Submission/Answer';
import QuestionAPI from './Question';

const AssessmentAPI = {
  assessments: new AssessmentsAPI(),
  categories: new CategoriesAPI(),
  submissions: new SubmissionsAPI(),
  submissionQuestions: new SubmissionQuestionsAPI(),
  answer: AnswerAPI,
  question: QuestionAPI,
};

Object.freeze(AssessmentAPI);

export default AssessmentAPI;
