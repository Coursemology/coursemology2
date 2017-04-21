import React from 'react';
import { Route, IndexRoute } from 'react-router';

import SubmissionEditLayout from './containers/SubmissionEditLayout';
import SubmissionEditIndex from './pages/SubmissionEditIndex';

export default (
  <Route
    path="courses/:courseId/assessments/:assessmentId/submissions/:submissionId/edit"
    component={SubmissionEditLayout}
  >
    <IndexRoute component={SubmissionEditIndex} />
  </Route>
);
