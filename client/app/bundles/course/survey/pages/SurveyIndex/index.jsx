import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { ListSubheader } from '@mui/material';
import { fetchSurveys } from 'course/survey/actions/surveys';
import surveyTranslations from 'course/survey/translations';
import { surveyShape } from 'course/survey/propTypes';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import withRouter from 'lib/components/withRouter';
import PageHeader from 'lib/components/pages/PageHeader';
import SurveysTable from './SurveysTable';
import NewSurveyButton from './NewSurveyButton';

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
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.noSurveys} />
        </ListSubheader>
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

export default withRouter(connect(mapStateToProps)(SurveyIndex));
