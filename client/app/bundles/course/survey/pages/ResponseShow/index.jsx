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
import { questionTypes } from 'course/survey/constants';
import surveyTranslations from 'course/survey/translations';
import { surveyShape, responseShape } from 'course/survey/propTypes';
import { fetchResponse, updateResponse } from 'course/survey/actions/responses';
import LoadingIndicator from 'course/survey/components/LoadingIndicator';
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
});

class ResponseShow extends React.Component {
  static propTypes = {
    surveys: PropTypes.arrayOf(surveyShape),
    response: responseShape,
    isLoading: PropTypes.bool.isRequired,
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  static buildAnswer(answer) {
    if (answer.question.question_type === questionTypes.MULTIPLE_CHOICE) {
      const selected_option = answer.options.find(option => option.selected);
      if (selected_option) {
        return { ...answer, selected_option: selected_option.question_option_id.toString() };
      }
    }
    return answer;
  }

  /**
   * Transforms the data from the server into the shaped used by the form.
   */
  static buildInitialValues({ sections }) {
    if (!sections) { return {}; }
    const buildSection = ({ answers, ...sectionFields }) => (
      { ...sectionFields, answers: answers.map(ResponseShow.buildAnswer) }
    );
    return { sections: sections.map(buildSection) };
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

  componentDidMount() {
    const { dispatch, params: { responseId } } = this.props;
    dispatch(fetchResponse(responseId));
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

  renderBody() {
    const { response, isLoading } = this.props;
    if (isLoading) { return <LoadingIndicator />; }

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
    const { surveys, params: { courseId, surveyId } } = this.props;
    const survey = surveys && surveys.length > 0 ?
                   surveys.find(s => String(s.id) === String(surveyId)) : {};
    return (
      <div>
        <TitleBar
          title={survey.title}
          iconElementLeft={<IconButton><ArrowBack /></IconButton>}
          onLeftIconButtonTouchTap={() => browserHistory.push(`/courses/${courseId}/surveys`)}
        />
        { survey.description ? <Card><CardText>{survey.description}</CardText></Card> : null }
        { this.renderBody() }
      </div>
    );
  }
}

export default connect(
  state => ({
    ...state.responseForm,
    surveys: state.surveys,
  })
)(ResponseShow);
