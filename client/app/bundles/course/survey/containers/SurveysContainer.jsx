import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Snackbar from 'material-ui/Snackbar';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import * as actionCreators from '../actions';
import SurveyFormDialogue from '../containers/SurveyFormDialogue';

const SurveysContainer = ({ dispatch, notification, children, deleteConfirmation }) => (
  <div>
    {children}
    <SurveyFormDialogue />
    <ConfirmationDialog
      confirmDelete
      {...deleteConfirmation}
      onCancel={() => dispatch(actionCreators.resetDeleteConfirmation())}
    />
    <Snackbar
      open={notification !== ''}
      message={notification}
    />
  </div>
);

SurveysContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  notification: PropTypes.string,
  children: PropTypes.node,
  deleteConfirmation: PropTypes.shape({
    open: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect(state => state)(SurveysContainer);
