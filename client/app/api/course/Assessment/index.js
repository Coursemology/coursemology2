import AnswerAPI from './Submission/Answer';
import AssessmentsAPI from './Assessments';
import CategoriesAPI from './Categories';
import QuestionAPI from './Question';
import SkillsAPI from './Skills';
import SubmissionQuestionsAPI from './SubmissionQuestions';
import SubmissionsAPI from './Submissions';

const AssessmentAPI = {
  assessments: new AssessmentsAPI(),
  categories: new CategoriesAPI(),
  submissions: new SubmissionsAPI(),
  submissionQuestions: new SubmissionQuestionsAPI(),
  answer: AnswerAPI,
  question: QuestionAPI,
  skills: new SkillsAPI(),
};

Object.freeze(AssessmentAPI);

export default AssessmentAPI;
