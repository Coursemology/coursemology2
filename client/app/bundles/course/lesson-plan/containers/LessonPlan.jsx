import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import LessonPlanContainer from './LessonPlanContainer';
import LessonPlanEdit from '../components/LessonPlanEdit';
import LessonPlanIndex from '../components/LessonPlanIndex';

const LessonPlan = () => (
  <Router history={browserHistory}>
    <Route component={LessonPlanContainer}>
      <Route path="/courses/:courseId/lesson_plan" component={LessonPlanIndex} />
      <Route path="/courses/:courseId/lesson_plan/edit" component={LessonPlanEdit} />
    </Route>
  </Router>
);

export default LessonPlan;
