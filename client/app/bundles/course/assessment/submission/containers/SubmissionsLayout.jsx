import { Route, Routes } from 'react-router-dom';

import SubmissionEditIndex from '../pages/SubmissionEditIndex';
import SubmissionsIndex from '../pages/SubmissionsIndex';

const SubmissionsLayout = () => {
  const submissionsIndex =
    '/courses/:courseId/assessments/:assessmentId/submissions';
  const submissionEdit =
    '/courses/:courseId/assessments/:assessmentId/submissions/:submissionId/edit';

  return (
    <Routes>
      <Route
        element={<SubmissionsIndex />}
        exact={true}
        path={submissionsIndex}
      />
      <Route
        element={<SubmissionEditIndex />}
        exact={true}
        path={submissionEdit}
      />
    </Routes>
  );
};

export default SubmissionsLayout;
