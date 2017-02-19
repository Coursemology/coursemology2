import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Snackbar from 'material-ui/Snackbar';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { resetDeleteConfirmation } from '../actions';
import SurveyFormDialogue from '../containers/SurveyFormDialogue';
import QuestionFormDialogue from '../containers/QuestionFormDialogue';

const SurveysContainer = ({ dispatch, notification, children, deleteConfirmation }) => (
  <div>
    {children}
    <SurveyFormDialogue />
    <QuestionFormDialogue />
    <ConfirmationDialog
      confirmDelete
      {...deleteConfirmation}
      onCancel={() => dispatch(resetDeleteConfirmation())}
    />
    <Snackbar
      open={notification !== ''}
      message={notification}
    />
  </div>
);

SurveysContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  notification: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  children: PropTypes.node,
  deleteConfirmation: PropTypes.shape({
    open: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect(state => state)(SurveysContainer);
