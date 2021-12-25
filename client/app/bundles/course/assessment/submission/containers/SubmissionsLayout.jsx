import { Route, Switch } from 'react-router-dom';

import SubmissionEditIndex from '../pages/SubmissionEditIndex';
import SubmissionsIndex from '../pages/SubmissionsIndex';

const SubmissionsLayout = () => {
  const submissionsIndex =
    '/courses/:courseId/assessments/:assessmentId/submissions';
  const submissionEdit =
    '/courses/:courseId/assessments/:assessmentId/submissions/:submissionId/edit';

  return (
    <Switch>
      <Route
        component={SubmissionsIndex}
        exact={true}
        path={submissionsIndex}
      />
      <Route
        component={SubmissionEditIndex}
        exact={true}
        path={submissionEdit}
      />
    </Switch>
  );
};

export default SubmissionsLayout;
