import React from 'react';
import { Switch, Route } from 'react-router-dom';

import SubmissionEditLayout from './containers/SubmissionEditLayout';
import SubmissionEditIndex from './pages/SubmissionEditIndex';

export default (
  <SubmissionEditLayout>
    <Switch>
      <Route
        exact
        path="/courses/:courseId/assessments/:assessmentId/submissions/:submissionId/edit"
        component={SubmissionEditIndex}
      />
    </Switch>
  </SubmissionEditLayout>
);
