import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';

import SubmissionEditIndex from '../pages/SubmissionEditIndex';

export default class SubmissionEditLayout extends Component {
  render() {
    return (
      <Switch>
        <Route
          exact
          path="/courses/:courseId/assessments/:assessmentId/submissions/:submissionId/edit"
          component={SubmissionEditIndex}
        />
      </Switch>
    );
  }
}

SubmissionEditLayout.propTypes = {
  children: PropTypes.node,
};
