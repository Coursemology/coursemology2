import React from 'react';
import { Route, IndexRoute } from 'react-router';
import SurveysContainer from './containers/SurveysContainer';
import Surveys from './containers/Surveys';
import ShowSurvey from './containers/ShowSurvey';

export default (
  <Route path="courses/:courseId/surveys" component={SurveysContainer}>
    <IndexRoute component={Surveys} />
    <Route path=":surveyId" component={ShowSurvey} />
  </Route>
);
