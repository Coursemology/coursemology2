import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Route, Switch } from 'react-router-dom';
import NotificationBar, { notificationShape } from 'lib/components/NotificationBar';
import SurveyFormDialogue from 'course/survey/containers/SurveyFormDialogue';
import QuestionFormDialogue from 'course/survey/containers/QuestionFormDialogue';
import SectionFormDialogue from 'course/survey/containers/SectionFormDialogue';
import SurveyLayout from 'course/survey/containers/SurveyLayout';
import SurveyIndex from 'course/survey/pages/SurveyIndex';
import DeleteConfirmation from './DeleteConfirmation';

const SurveysLayout = ({ notification }) => {
  const surveyRoot = '/courses/:courseId/surveys';
  return (
    <div>
      <SurveyFormDialogue />
      <QuestionFormDialogue />
      <SectionFormDialogue />
      <DeleteConfirmation />
      <NotificationBar notification={notification} />

      <Switch>
        <Route exact path={surveyRoot} component={SurveyIndex} />
        <Route path={`${surveyRoot}/:surveyId`} component={SurveyLayout} />
      </Switch>
    </div>
  );
};

SurveysLayout.propTypes = {
  notification: notificationShape,
};

export default withRouter(connect(({ notification }) => ({ notification }))(SurveysLayout));
