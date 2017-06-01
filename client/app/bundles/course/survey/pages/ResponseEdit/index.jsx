import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';
import surveyTranslations from 'course/survey/translations';
import { surveyShape, responseShape } from 'course/survey/propTypes';
import { fetchEditableResponse, updateResponse } from 'course/survey/actions/responses';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import ResponseForm, { buildInitialValues, buildResponsePayload } from 'course/survey/containers/ResponseForm';

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

  componentDidMount() {
    const { dispatch, match: { params: { responseId } } } = this.props;
    dispatch(fetchEditableResponse(responseId));
  }

  handleUpdateResponse = (data) => {
    const { dispatch, match: { params: { responseId } } } = this.props;
    const { saveSuccess, saveFailure, submitSuccess, submitFailure } = translations;
    const payload = buildResponsePayload(data);
    const successMessage = <FormattedMessage {...(data.submit ? submitSuccess : saveSuccess)} />;
    const failureMessage = <FormattedMessage {...(data.submit ? submitFailure : saveFailure)} />;

    return dispatch(
      updateResponse(responseId, payload, successMessage, failureMessage)
    );
  }

  renderBody() {
    const { survey, response, flags } = this.props;
    if (flags.isLoading) { return <LoadingIndicator />; }

    const initialValues = buildInitialValues(survey, response);
    return (
      <div>
        <Subheader><FormattedMessage {...surveyTranslations.questions} /></Subheader>
        <ResponseForm
          onSubmit={this.handleUpdateResponse}
          {...{ response, flags, initialValues }}
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
