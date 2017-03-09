import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import NotificationBar, { notificationShape } from 'lib/components/NotificationBar';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { resetDeleteConfirmation } from '../actions';
import SurveyFormDialogue from '../containers/SurveyFormDialogue';
import QuestionFormDialogue from '../containers/QuestionFormDialogue';
import SectionFormDialogue from '../containers/SectionFormDialogue';

const SurveyLayout = ({ dispatch, notification, children, deleteConfirmation }) => (
  <div>
    {children}
    <SurveyFormDialogue />
    <QuestionFormDialogue />
    <SectionFormDialogue />
    <ConfirmationDialog
      confirmDelete
      {...deleteConfirmation}
      onCancel={() => dispatch(resetDeleteConfirmation())}
    />
    <NotificationBar notification={notification} />
  </div>
);

SurveyLayout.propTypes = {
  dispatch: PropTypes.func.isRequired,
  notification: notificationShape,
  children: PropTypes.node,
  deleteConfirmation: PropTypes.shape({
    open: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect(state => state)(SurveyLayout);
