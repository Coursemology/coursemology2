import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { fetchSurveys } from 'course/survey/actions/surveys';
import { surveyShape } from 'course/survey/propTypes';
import surveyTranslations from 'course/survey/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import PageHeader from 'lib/components/navigation/PageHeader';
import withRouter from 'lib/components/navigation/withRouter';

import Dialogs from '../../components/Dialogs';

import NewSurveyButton from './NewSurveyButton';
import SurveysTable from './SurveysTable';

const translations = defineMessages({
  noSurveys: {
    id: 'course.survey.SurveyIndex.noSurveys',
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
    if (surveys.length === 0) {
      return (
        <Note message={<FormattedMessage {...translations.noSurveys} />} />
      );
    }
    return <SurveysTable {...{ courseId }} />;
  }

  render() {
    return (
      <>
        <PageHeader
          title={<FormattedMessage {...surveyTranslations.surveys} />}
        />

        {this.renderBody()}

        <NewSurveyButton />

        <Dialogs />
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

const mapStateToProps = ({ surveys }) => ({
  surveys: surveys.surveys,
  isLoading: surveys.surveysFlags.isLoadingSurveys,
});

export default withRouter(connect(mapStateToProps)(SurveyIndex));
