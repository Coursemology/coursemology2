import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Card, CardContent } from '@material-ui/core';
import { ListSubheader } from '@mui/material';
import surveyTranslations from 'course/survey/translations';
import { surveyShape, responseShape } from 'course/survey/propTypes';
import {
  fetchEditableResponse,
  updateResponse,
} from 'course/survey/actions/responses';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import ResponseForm, {
  buildInitialValues,
  buildResponsePayload,
} from 'course/survey/containers/ResponseForm';

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

class ResponseEdit extends Component {
  componentDidMount() {
    const {
      dispatch,
      match: {
        params: { responseId },
      },
    } = this.props;
    dispatch(fetchEditableResponse(responseId));
  }

  handleUpdateResponse = (data) => {
    const {
      dispatch,
      match: {
        params: { responseId },
      },
    } = this.props;
    const { saveSuccess, saveFailure, submitSuccess, submitFailure } =
      translations;
    const payload = buildResponsePayload(data);
    const successMessage = (
      <FormattedMessage {...(data.submit ? submitSuccess : saveSuccess)} />
    );
    const failureMessage = (
      <FormattedMessage {...(data.submit ? submitFailure : saveFailure)} />
    );

    return dispatch(
      updateResponse(responseId, payload, successMessage, failureMessage),
    );
  };

  renderBody() {
    const { survey, response, flags } = this.props;
    if (flags.isLoading) {
      return <LoadingIndicator />;
    }

    const initialValues = buildInitialValues(survey, response);
    return (
      <>
        <ListSubheader disableSticky>
          <FormattedMessage {...surveyTranslations.questions} />
        </ListSubheader>
        <ResponseForm
          onSubmit={this.handleUpdateResponse}
          {...{ response, flags, initialValues }}
        />
      </>
    );
  }

  render() {
    const { survey } = this.props;
    return (
      <>
        {survey.description ? (
          <Card>
            <CardContent
              dangerouslySetInnerHTML={{ __html: survey.description }}
            />
          </Card>
        ) : null}
        {this.renderBody()}
      </>
    );
  }
}

ResponseEdit.propTypes = {
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

export default connect((state) => state.responseForm)(ResponseEdit);
