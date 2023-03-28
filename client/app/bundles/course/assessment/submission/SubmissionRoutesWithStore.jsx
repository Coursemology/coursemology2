import { Route, Routes } from 'react-router-dom';

import { StoreProviderWrapper } from 'lib/components/wrappers/ProviderWrapper';

import SubmissionEditIndex from './pages/SubmissionEditIndex';
import SubmissionsIndex from './pages/SubmissionsIndex';
import store from './store';

const SubmissionRoutesWithStore = () => {
  const submissionsIndex =
    '/courses/:courseId/assessments/:assessmentId/submissions';
  const submissionEdit =
    '/courses/:courseId/assessments/:assessmentId/submissions/:submissionId/edit';

  return (
    <StoreProviderWrapper store={store}>
      <Routes>
        <Route element={<SubmissionsIndex />} exact path={submissionsIndex} />
        <Route element={<SubmissionEditIndex />} exact path={submissionEdit} />
      </Routes>
    </StoreProviderWrapper>
  );
};

export default SubmissionRoutesWithStore;
