import { useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, ListSubheader, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import {
  fetchEditableResponse,
  updateResponse,
} from 'course/survey/actions/responses';
import ResponseForm, {
  buildInitialValues,
  buildResponsePayload,
} from 'course/survey/containers/ResponseForm';
import { responseShape, surveyShape } from 'course/survey/propTypes';
import surveyTranslations from 'course/survey/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import withRouter from 'lib/components/navigation/withRouter';

import withSurveyLayout from '../../containers/SurveyLayout';

const translations = defineMessages({
  response: {
    id: 'course.survey.ResponseEdit.response',
    defaultMessage: 'Response',
  },
  saveSuccess: {
    id: 'course.survey.ResponseEdit.saveSuccess',
    defaultMessage: 'Your response has been saved.',
  },
  saveFailure: {
    id: 'course.survey.ResponseEdit.saveFailure',
    defaultMessage: 'Saving Failed.',
  },
  submitSuccess: {
    id: 'course.survey.ResponseEdit.submitSuccess',
    defaultMessage: 'Your response has been submitted.',
  },
  submitFailure: {
    id: 'course.survey.ResponseEdit.submitFailure',
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

  const handleUpdateResponse = (data, setError) => {
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
        setError,
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
          <CardContent>
            <Typography
              dangerouslySetInnerHTML={{ __html: survey.description }}
              variant="body2"
            />
          </CardContent>
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

const handle = translations.response;

export default Object.assign(
  withSurveyLayout(
    withRouter(connect(({ surveys }) => surveys.responseForm)(ResponseEdit)),
  ),
  { handle },
);
