import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Snackbar from 'material-ui/Snackbar';
import SurveyFormDialogue from '../containers/SurveyFormDialogue';

const SurveysContainer = ({ notification, children }) => (
  <div>
    {children}
    <SurveyFormDialogue />
    <Snackbar
      open={notification !== ''}
      message={notification}
    />
  </div>
);

SurveysContainer.propTypes = {
  notification: PropTypes.string,
  children: PropTypes.node,
};

export default connect(state => state)(SurveysContainer);
