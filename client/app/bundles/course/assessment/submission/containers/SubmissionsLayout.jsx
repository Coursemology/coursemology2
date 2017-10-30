import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import SubmissionEditIndex from '../pages/SubmissionEditIndex';
import SubmissionsIndex from '../pages/SubmissionsIndex';

export default class SubmissionsLayout extends Component {
  render() {
    const submissionsIndex = '/courses/:courseId/assessments/:assessmentId/submissions';
    const submissionEdit = '/courses/:courseId/assessments/:assessmentId/submissions/:submissionId/edit';

    return (
      <Switch>
        <Route exact path={submissionsIndex} component={SubmissionsIndex} />
        <Route exact path={submissionEdit} component={SubmissionEditIndex} />
      </Switch>
    );
  }
}
