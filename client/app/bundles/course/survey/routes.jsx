import React from 'react';
import { Route, IndexRoute } from 'react-router';
import SurveyLayout from './containers/SurveyLayout';
import SurveyIndex from './pages/SurveyIndex';
import SurveyShow from './pages/SurveyShow';
import SurveyResults from './pages/SurveyResults';
import ResponseShow from './pages/ResponseShow';
import ResponseEdit from './pages/ResponseEdit';
import ResponseIndex from './pages/ResponseIndex';

export default (
  <Route path="courses/:courseId/surveys" component={SurveyLayout}>
    <IndexRoute component={SurveyIndex} />
    <Route path=":surveyId">
      <IndexRoute component={SurveyShow} />
      <Route path="results" component={SurveyResults} />
      <Route path="responses">
        <IndexRoute component={ResponseIndex} />
        <Route path=":responseId">
          <IndexRoute component={ResponseShow} />
          <Route path="edit" component={ResponseEdit} />
        </Route>
      </Route>
    </Route>
  </Route>
);
