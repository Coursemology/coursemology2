import React from 'react';
import { Router } from 'react-router-dom';
import history from 'lib/history';
import LessonPlanContainer from './LessonPlanContainer';

const LessonPlan = () => (
  <Router history={history}>
    <LessonPlanContainer />
  </Router>
);

export default LessonPlan;
