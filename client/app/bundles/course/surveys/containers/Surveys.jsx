import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Snackbar from 'material-ui/Snackbar';
import SurveysEmpty from '../components/SurveysEmpty';
import SurveysTable from '../components/SurveysTable';
import NewSurvey from '../containers/NewSurvey';

const propTypes = {
  surveys: PropTypes.array.isRequired,
  notification: PropTypes.string,
};

const Surveys = ({ surveys, notification }) => {
  surveys.sort((a, b) => new Date(a.start_at) - new Date(b.start_at));

  return (
    <div>
      { surveys.length > 0 ? <SurveysTable {...{ surveys }} /> : <SurveysEmpty /> }
      <NewSurvey />
      <Snackbar
        open={notification !== ''}
        message={notification}
      />
    </div>
  );
};

Surveys.propTypes = propTypes;

export default connect(state => state)(Surveys);
