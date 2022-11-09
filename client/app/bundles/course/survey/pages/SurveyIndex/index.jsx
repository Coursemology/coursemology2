import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { ListSubheader } from '@mui/material';
import PropTypes from 'prop-types';

import { fetchSurveys } from 'course/survey/actions/surveys';
import { surveyShape } from 'course/survey/propTypes';
import surveyTranslations from 'course/survey/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import withRouter from 'lib/components/navigation/withRouter';

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
        <ListSubheader disableSticky={true}>
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
