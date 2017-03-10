/* eslint-disable camelcase */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import IconButton from 'material-ui/IconButton';
import { Card, CardText } from 'material-ui/Card';
import TitleBar from 'lib/components/TitleBar';
import Subheader from 'material-ui/Subheader';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import { sorts } from '../../utils';
import { questionTypes } from '../../constants';
import surveyTranslations from '../../translations';
import { surveyShape, responseShape } from '../../propTypes';
import { fetchResponse, updateResponse } from '../../actions/responses';
import ResponseForm from './ResponseForm';

const translations = defineMessages({
  saveSuccess: {
    id: 'course.surveys.ResponseShow.saveSuccess',
    defaultMessage: 'Your response has been saved.',
  },
  saveFailure: {
    id: 'course.surveys.ResponseShow.saveFailure',
    defaultMessage: 'Saving Failed.',
  },
  submitSuccess: {
    id: 'course.surveys.ResponseShow.submitSuccess',
    defaultMessage: 'Your response has been submitted.',
  },
  submitFailure: {
    id: 'course.surveys.ResponseShow.submitFailure',
    defaultMessage: 'Submit Failed.',
  },
  loading: {
    id: 'course.surveys.ResponseShow.loading',
    defaultMessage: 'Loading survey questions...',
  },
});

class ResponseShow extends React.Component {
  static propTypes = {
    survey: surveyShape,
    response: responseShape,
    isLoading: PropTypes.bool.isRequired,
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  static buildAnswer(answer) {
    const { options, ...answerFields } = answer;
    if (answerFields.question.question_type === questionTypes.MULTIPLE_CHOICE) {
      const selected_option = options.find(option => option.selected);
      if (selected_option) {
        answerFields.selected_option = selected_option.question_option_id.toString();
      }
    }
    return { ...answerFields, options: options.sort(sorts.byWeight) };
  }

  /**
   * Transforms the data from the server into the shaped used by the form.
   */
  static buildInitialValues({ sections }) {
    if (!sections) { return {}; }
    const byQuestionWeight = (a, b) => a.question.weight - b.question.weight;
    const buildSection = ({ answers, ...sectionFields }) => (
      { ...sectionFields, answers: answers.sort(byQuestionWeight).map(ResponseShow.buildAnswer) }
    );
    return { sections: sections.sort(sorts.byWeight).map(buildSection) };
  }

  static formatAnswer(answer) {
    const { id, text_response, options, selected_option, question } = answer;
    const isMultipleChoice =
      question.question_type === questionTypes.MULTIPLE_CHOICE && selected_option;
    const reduceOption = ({ id: optionId, selected, question_option_id }) => ({
      id: optionId,
      selected: isMultipleChoice ? (question_option_id.toString() === selected_option) : selected,
    });
    return ({ id, text_response, options_attributes: options.map(reduceOption) });
  }

  /**
   * Transforms the form data into the JSON shape that the endpoint expects to receive.
   */
  static formatSurveyResponseData(data) {
    const answers_attributes = data.sections.reduce((accumulator, section) => (
      accumulator.concat(section.answers.map(ResponseShow.formatAnswer))
    ), []);
    return { response: { answers_attributes, submit: data.submit } };
  }

  static renderDescription(survey) {
    if (!survey.description) { return null; }
    return (
      <Card>
        <CardText>{survey.description}</CardText>
      </Card>
    );
  }

  componentDidMount() {
    const { dispatch, isLoading, params: { responseId } } = this.props;

    if (!isLoading) {
      dispatch(fetchResponse(responseId));
    }
  }

  handleUpdateResponse = (data) => {
    const { dispatch, params: { responseId } } = this.props;
    const { saveSuccess, saveFailure, submitSuccess, submitFailure } = translations;
    const payload = ResponseShow.formatSurveyResponseData(data);
    const successMessage = <FormattedMessage {...(data.submit ? submitSuccess : saveSuccess)} />;
    const failureMessage = <FormattedMessage {...(data.submit ? submitFailure : saveFailure)} />;

    return dispatch(
      updateResponse(responseId, payload, successMessage, failureMessage)
    );
  }

  renderForm() {
    const { response, isLoading } = this.props;

    if (isLoading) {
      return <Subheader><FormattedMessage {...translations.loading} /></Subheader>;
    }

    return (
      <div>
        <Subheader><FormattedMessage {...surveyTranslations.questions} /></Subheader>
        <ResponseForm
          initialValues={ResponseShow.buildInitialValues(response)}
          onSubmit={this.handleUpdateResponse}
          {...{ response }}
        />
      </div>
    );
  }

  render() {
    const { survey, params: { courseId } } = this.props;

    return (
      <div>
        <TitleBar
          title={survey.title}
          iconElementLeft={<IconButton><ArrowBack /></IconButton>}
          onLeftIconButtonTouchTap={() => browserHistory.push(`/courses/${courseId}/surveys`)}
        />
        { ResponseShow.renderDescription(survey) }
        { this.renderForm() }
      </div>
    );
  }
}

export default connect(
  state => state.responseForm
)(ResponseShow);
