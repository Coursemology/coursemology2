import AssessmentsAPI from './Assessments';
import SubmissionsAPI from './Submissions';
import SubmissionQuestionsAPI from './SubmissionQuestions';

const AssessmentAPI = {
  assessments: new AssessmentsAPI(),
  submissions: new SubmissionsAPI(),
  submissionQuestions: new SubmissionQuestionsAPI(),
};

Object.freeze(AssessmentAPI);

export default AssessmentAPI;
