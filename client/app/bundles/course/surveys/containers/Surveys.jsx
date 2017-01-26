import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import TitleBar from 'lib/components/TitleBar';
import * as actionCreators from '../actions';
import SurveysEmpty from '../components/SurveysEmpty';
import SurveysTable from '../components/SurveysTable';
import NewSurveyButton from '../containers/NewSurveyButton';
import translations from '../translations';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  surveys: PropTypes.array.isRequired,
  params: PropTypes.shape({
    courseId: PropTypes.string.isRequired,
  }),
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class Surveys extends React.Component {
  componentDidMount() {
    const { dispatch, params: { courseId } } = this.props;
    dispatch(actionCreators.fetchSurveys(courseId));
  }

  render() {
    const { intl, surveys, params: { courseId } } = this.props;
    surveys.sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
    return (
      <div>
        <TitleBar
          title={intl.formatMessage(translations.surveys)}
        />
        { surveys.length > 0 ? <SurveysTable {...{ surveys, courseId }} /> : <SurveysEmpty /> }
        <NewSurveyButton {...{ courseId }} />
      </div>
    );
  }
}

Surveys.propTypes = propTypes;

export default connect(state => state)(injectIntl(Surveys));
