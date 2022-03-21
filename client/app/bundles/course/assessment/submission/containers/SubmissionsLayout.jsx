import { Routes, Route } from 'react-router-dom';
import SubmissionEditIndex from '../pages/SubmissionEditIndex';
import SubmissionsIndex from '../pages/SubmissionsIndex';

const SubmissionsLayout = () => {
  const submissionsIndex =
    '/courses/:courseId/assessments/:assessmentId/submissions';
  const submissionEdit =
    '/courses/:courseId/assessments/:assessmentId/submissions/:submissionId/edit';

  return (
    <Routes>
      <Route exact path={submissionsIndex} element={<SubmissionsIndex />} />
      <Route exact path={submissionEdit} element={<SubmissionEditIndex />} />
    </Routes>
  );
};

export default SubmissionsLayout;
