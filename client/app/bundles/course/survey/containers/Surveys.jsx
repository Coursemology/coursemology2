import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import TitleBar from 'lib/components/TitleBar';
import { fetchSurveys } from '../actions/surveys';
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
};

class Surveys extends React.Component {
  componentDidMount() {
    const { dispatch, params: { courseId } } = this.props;
    dispatch(fetchSurveys(courseId));
  }

  render() {
    const { surveys, params: { courseId } } = this.props;
    surveys.sort((a, b) => {
      const dateOrder = new Date(a.start_at) - new Date(b.start_at);
      return dateOrder === 0 ? a.title.localeCompare(b.title) : dateOrder;
    });
    return (
      <div>
        <TitleBar
          title={<FormattedMessage {...translations.surveys} />}
        />
        { surveys.length > 0 ? <SurveysTable {...{ surveys, courseId }} /> : <SurveysEmpty /> }
        <NewSurveyButton {...{ courseId }} />
      </div>
    );
  }
}

Surveys.propTypes = propTypes;

export default connect(state => state)(Surveys);
