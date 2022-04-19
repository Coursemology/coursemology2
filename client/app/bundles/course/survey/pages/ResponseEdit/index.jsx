import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Card, CardContent, ListSubheader } from '@mui/material';
import surveyTranslations from 'course/survey/translations';
import { surveyShape, responseShape } from 'course/survey/propTypes';
import {
  fetchEditableResponse,
  updateResponse,
} from 'course/survey/actions/responses';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import withRouter from 'lib/components/withRouter';
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

const ResponseEdit = (props) => {
  const {
    dispatch,
    flags,
    match: {
      params: { responseId },
    },
    response,
    survey,
  } = props;
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchEditableResponse(responseId));
  }, [dispatch, responseId]);

  const handleUpdateResponse = (data) => {
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
      updateResponse(
        responseId,
        payload,
        successMessage,
        failureMessage,
        navigate,
      ),
    );
  };

  const renderBody = () => {
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
          onSubmit={handleUpdateResponse}
          {...{ response, flags, initialValues }}
        />
      </>
    );
  };

  return (
    <>
      {survey.description ? (
        <Card>
          <CardContent
            dangerouslySetInnerHTML={{ __html: survey.description }}
          />
        </Card>
      ) : null}
      {renderBody()}
    </>
  );
};

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

export default withRouter(connect((state) => state.responseForm)(ResponseEdit));
