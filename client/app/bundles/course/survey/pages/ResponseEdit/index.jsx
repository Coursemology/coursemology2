/* eslint-disable camelcase */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';
import { questionTypes } from 'course/survey/constants';
import surveyTranslations from 'course/survey/translations';
import { surveyShape, responseShape } from 'course/survey/propTypes';
import { fetchEditableResponse, updateResponse } from 'course/survey/actions/responses';
import LoadingIndicator from 'course/survey/components/LoadingIndicator';
import ResponseForm from 'course/survey/containers/ResponseForm';

const translations = defineMessages({
  saveSuccess: {
    id: 'course.surveys.ResponseEdit.saveSuccess',
    defaultMessage: 'Your response has been saved.',
  },
  saveFailure: {
    id: 'course.surveys.ResponseEdit.saveFailure',
    defaultMessage: 'Saving Failed.',
  },
  submitSuccess: {
    id: 'course.surveys.ResponseEdit.submitSuccess',
    defaultMessage: 'Your response has been submitted.',
  },
  submitFailure: {
    id: 'course.surveys.ResponseEdit.submitFailure',
    defaultMessage: 'Submit Failed.',
  },
});

class ResponseEdit extends React.Component {
  static propTypes = {
    survey: surveyShape,
    response: responseShape,
    flags: PropTypes.shape({
      isLoading: PropTypes.bool.isRequired,
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
        responseId: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  static formatAnswer(answer) {
    const { id, text_response, options, selected_option, question } = answer;
    const isMultipleChoice =
      question.question_type === questionTypes.MULTIPLE_CHOICE && selected_option;
    const reduceOption = ({ id: optionId, selected, question_option_id }) => ({
      id: optionId,
      selected: isMultipleChoice ? (question_option_id === selected_option) : selected,
    });
    return ({ id, text_response, options_attributes: options.map(reduceOption) });
  }

  /**
   * Transforms the form data into the JSON shape that the endpoint expects to receive.
   */
  static formatSurveyResponseData(data) {
    const answers_attributes = data.sections.reduce((accumulator, section) => (
      accumulator.concat(section.answers.map(ResponseEdit.formatAnswer))
    ), []);
    return { response: { answers_attributes, submit: data.submit, unsubmit: data.unsubmit } };
  }

  componentDidMount() {
    const { dispatch, match: { params: { responseId } } } = this.props;
    dispatch(fetchEditableResponse(responseId));
  }

  handleUpdateResponse = (data) => {
    const { dispatch, match: { params: { responseId } } } = this.props;
    const { saveSuccess, saveFailure, submitSuccess, submitFailure } = translations;
    const payload = ResponseEdit.formatSurveyResponseData(data);
    const successMessage = <FormattedMessage {...(data.submit ? submitSuccess : saveSuccess)} />;
    const failureMessage = <FormattedMessage {...(data.submit ? submitFailure : saveFailure)} />;

    return dispatch(
      updateResponse(responseId, payload, successMessage, failureMessage)
    );
  }

  renderBody() {
    const { response, flags } = this.props;
    if (flags.isLoading) { return <LoadingIndicator />; }

    return (
      <div>
        <Subheader><FormattedMessage {...surveyTranslations.questions} /></Subheader>
        <ResponseForm
          initialValues={response}
          onSubmit={this.handleUpdateResponse}
          {...{ response, flags }}
        />
      </div>
    );
  }

  render() {
    const { survey } = this.props;
    return (
      <div>
        {
          survey.description ?
            <Card><CardText dangerouslySetInnerHTML={{ __html: survey.description }} /></Card> :
          null
        }
        { this.renderBody() }
      </div>
    );
  }
}

export default connect(state => state.responseForm)(ResponseEdit);
