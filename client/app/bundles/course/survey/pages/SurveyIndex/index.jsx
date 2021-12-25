import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import Subheader from 'material-ui/Subheader';
import PropTypes from 'prop-types';

import { fetchSurveys } from 'course/survey/actions/surveys';
import { surveyShape } from 'course/survey/propTypes';
import surveyTranslations from 'course/survey/translations';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import TitleBar from 'lib/components/TitleBar';

import NewSurveyButton from './NewSurveyButton';
import SurveysTable from './SurveysTable';

const translations = defineMessages({
  noSurveys: {
    id: 'course.surveys.SurveyIndex.noSurveys',
    defaultMessage: 'No surveys have been created.',
  },
});

class SurveyIndex extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchSurveys());
  }

  renderBody() {
    const {
      surveys,
      isLoading,
      match: {
        params: { courseId },
      },
    } = this.props;
    if (isLoading) {
      return <LoadingIndicator />;
    }
    if (surveys.length < 1) {
      return (
        <Subheader>
          <FormattedMessage {...translations.noSurveys} />
        </Subheader>
      );
    }
    return <SurveysTable {...{ courseId }} />;
  }

  render() {
    return (
      <>
        <TitleBar
          title={<FormattedMessage {...surveyTranslations.surveys} />}
        />
        {this.renderBody()}
        <NewSurveyButton />
      </>
    );
  }
}

SurveyIndex.propTypes = {
  surveys: PropTypes.arrayOf(surveyShape),
  isLoading: PropTypes.bool.isRequired,

  dispatch: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
    }),
  }),
};

const mapStateToProps = (state) => ({
  surveys: state.surveys,
  isLoading: state.surveysFlags.isLoadingSurveys,
});

export default connect(mapStateToProps)(SurveyIndex);
