import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../actions';
import SurveyDetails from '../components/SurveyDetails';

class ShowSurvey extends React.Component {
  componentDidMount() {
    const {
      dispatch,
      params: { courseId, surveyId },
    } = this.props;
    dispatch(actionCreators.fetchSurvey(courseId, surveyId));
  }

  render() {
    const { surveys, params: { surveyId } } = this.props;
    const survey = surveys && surveys.length > 0 ?
                   surveys.find(s => String(s.id) === String(surveyId)) : {};
    return <SurveyDetails survey={survey} />;
  }
}

ShowSurvey.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    surveyId: PropTypes.string.isRequired,
  }).isRequired,
  surveys: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default connect(state => state)(ShowSurvey);
