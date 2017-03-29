import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import TitleBar from 'lib/components/TitleBar';
import { fetchSurveys } from 'course/survey/actions/surveys';
import surveyTranslations from 'course/survey/translations';
import { surveyShape } from 'course/survey/propTypes';
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
    dispatch: PropTypes.func.isRequired,
    surveys: PropTypes.arrayOf(surveyShape),
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
    }),
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchSurveys());
  }

  render() {
    const { surveys, params: { courseId } } = this.props;
    return (
      <div>
        <TitleBar
          title={<FormattedMessage {...surveyTranslations.surveys} />}
        />
        {
          surveys.length > 0 ?
            <SurveysTable {...{ courseId }} /> :
            <Subheader><FormattedMessage {...translations.noSurveys} /></Subheader>
        }
        <NewSurveyButton />
      </div>
    );
  }
}

export default connect(state => state)(SurveyIndex);
