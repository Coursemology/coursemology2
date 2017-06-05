import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import TitleBar from 'lib/components/TitleBar';
import { fetchSurveys } from 'course/survey/actions/surveys';
import surveyTranslations from 'course/survey/translations';
import { surveyShape } from 'course/survey/propTypes';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import SurveysTable from './SurveysTable';
import NewSurveyButton from './NewSurveyButton';

const translations = defineMessages({
  noSurveys: {
    id: 'course.surveys.SurveyIndex.noSurveys',
    defaultMessage: 'No surveys have been created.',
  },
});

class SurveyIndex extends React.Component {
  static propTypes = {
    surveys: PropTypes.arrayOf(surveyShape),
    isLoading: PropTypes.bool.isRequired,

    dispatch: PropTypes.func.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        courseId: PropTypes.string.isRequired,
      }),
    }),
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchSurveys());
  }

  renderBody() {
    const { surveys, isLoading, match: { params: { courseId } } } = this.props;
    if (isLoading) { return <LoadingIndicator />; }
    if (surveys.length < 1) {
      return <Subheader><FormattedMessage {...translations.noSurveys} /></Subheader>;
    }
    return <SurveysTable {...{ courseId }} />;
  }

  render() {
    return (
      <div>
        <TitleBar
          title={<FormattedMessage {...surveyTranslations.surveys} />}
        />
        { this.renderBody() }
        <NewSurveyButton />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  surveys: state.surveys,
  isLoading: state.surveysFlags.isLoadingSurveys,
});

export default connect(mapStateToProps)(SurveyIndex);
