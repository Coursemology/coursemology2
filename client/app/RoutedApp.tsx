import { BrowserRouter, Route, Routes } from 'react-router-dom';

import SubmissionsIndex from 'bundles/course/assessment/submissions/SubmissionsIndex';
import DisbursementIndex from 'bundles/course/experience-points/disbursement/pages/DisbursementIndex';
import TimelineDesigner from 'bundles/course/reference-timelines/TimelineDesigner';

import App from './App';

const RoutedApp = (): JSX.Element => {
  return (
    <App>
      <BrowserRouter>
        <Routes>
          <Route
            element={<SubmissionsIndex />}
            path="/courses/:courseId/assessments/submissions"
          />

          <Route
            element={<TimelineDesigner />}
            path="/courses/:course_id/timelines"
          />

          <Route
            element={<DisbursementIndex />}
            path="/courses/:courseId/users/disburse_experience_points"
          />
        </Routes>
      </BrowserRouter>
    </App>
  );
};

export default RoutedApp;
