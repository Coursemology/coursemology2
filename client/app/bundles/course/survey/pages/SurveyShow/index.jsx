/* eslint-disable new-cap */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Subheader from 'material-ui/Subheader';
import surveyTranslations from 'course/survey/translations';
import { surveyShape } from 'course/survey/propTypes';
import * as surveyActions from 'course/survey/actions/surveys';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import SurveyDetails from './SurveyDetails';
import Section from './Section';

const translations = defineMessages({
  empty: {
    id: 'course.surveys.SurveyShow.empty',
    defaultMessage: 'This survey does not have any questions.',
  },
});

class SurveyShow extends React.Component {
  componentDidMount() {
    const { dispatch, surveyId } = this.props;
    dispatch(surveyActions.fetchSurvey(surveyId));
  }

  renderBody(survey) {
    const { intl, isLoading, disabled } = this.props;
    const { sections, canUpdate } = survey;
    if (isLoading) { return <LoadingIndicator />; }
    if (!canUpdate) { return null; }
    if (!sections || sections.length < 1) {
      return <Subheader>{ intl.formatMessage(translations.empty) }</Subheader>;
    }
    const lastIndex = sections.length - 1;

    return (
      <div>
        <Subheader>{ intl.formatMessage(surveyTranslations.questions) }</Subheader>
        {
          sections.map((section, index) =>
            (<Section
              key={section.id}
              first={index === 0}
              last={index === lastIndex}
              {...{ section, index, survey, disabled }}
            />)
          )
        }
      </div>
    );
  }

  render() {
    const { survey, disabled, courseId } = this.props;
    return (
      <div>
        <SurveyDetails {...{ survey, courseId, disabled }} />
        { this.renderBody(survey) }
      </div>
    );
  }
}

SurveyShow.propTypes = {
  dispatch: PropTypes.func.isRequired,
  survey: surveyShape,
  intl: intlShape.isRequired,
  isLoading: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
  surveyId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  isLoading: state.surveysFlags.isLoadingSurvey,
  disabled: state.surveysFlags.disableSurveyShow,
});
export const ConnectedSurveyShow = connect(mapStateToProps)(injectIntl(SurveyShow));
export default DragDropContext(HTML5Backend)(ConnectedSurveyShow);
