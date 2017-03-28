import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import NotificationBar, { notificationShape } from 'lib/components/NotificationBar';
import SurveyFormDialogue from 'course/survey/containers/SurveyFormDialogue';
import QuestionFormDialogue from 'course/survey/containers/QuestionFormDialogue';
import SectionFormDialogue from 'course/survey/containers/SectionFormDialogue';
import DeleteConfirmation from './DeleteConfirmation';

const SurveyLayout = ({ notification, children }) => (
  <div>
    {children}
    <SurveyFormDialogue />
    <QuestionFormDialogue />
    <SectionFormDialogue />
    <DeleteConfirmation />
    <NotificationBar notification={notification} />
  </div>
);

SurveyLayout.propTypes = {
  notification: notificationShape,
  children: PropTypes.node,
};

export default connect(({ notification }) => ({ notification }))(SurveyLayout);
