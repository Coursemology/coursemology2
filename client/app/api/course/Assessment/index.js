import AnswerAPI from './Submission/Answer';
import AssessmentsAPI from './Assessments';
import CategoriesAPI from './Categories';
import QuestionAPI from './Question';
import SessionsAPI from './Sessions';
import SkillsAPI from './Skills';
import SubmissionQuestionsAPI from './SubmissionQuestions';
import SubmissionsAPI from './Submissions';

const AssessmentAPI = {
  answer: AnswerAPI,
  assessments: new AssessmentsAPI(),
  categories: new CategoriesAPI(),
  question: QuestionAPI,
  sessions: new SessionsAPI(),
  skills: new SkillsAPI(),
  submissionQuestions: new SubmissionQuestionsAPI(),
  submissions: new SubmissionsAPI(),
};

Object.freeze(AssessmentAPI);

export default AssessmentAPI;
