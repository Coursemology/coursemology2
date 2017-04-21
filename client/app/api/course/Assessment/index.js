import AssessmentsAPI from './Assessments';
import SubmissionsAPI from './Submissions';

const AssessmentAPI = {
  assessments: new AssessmentsAPI(),
  submissions: new SubmissionsAPI(),
};

Object.freeze(AssessmentAPI);

export default AssessmentAPI;
