/* eslint-disable camelcase */
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import { responseShape } from 'course/survey/propTypes';
import ErrorText from 'lib/components/core/ErrorText';
import usePrompt from 'lib/hooks/router/usePrompt';
import formTranslations from 'lib/translations/form';

import ResponseSection from './ResponseSection';

const styles = {
  formButton: {
    marginRight: 10,
  },
};

const responseFormTranslations = defineMessages({
  submitted: {
    id: 'course.survey.ResponseForm.submitted',
    defaultMessage: 'Submitted',
  },
});

/**
 * Merges response answers into survey data to form initialValues for react-hook-form.
 */
export const buildInitialValues = (survey, response) => {
  if (!survey || !response || !response.answers) {
    return {};
  }

  const answersHash = {};
  response.answers.forEach((answer) => {
    answersHash[answer.question_id] = answer;
  });

  const augmentQuestionWithAnswer = (question) => ({
    ...question,
    answer: answersHash[question.id],
  });
  const augmentSectionWithAnswers = (section) => ({
    ...section,
    questions:
      section.questions && section.questions.map(augmentQuestionWithAnswer),
  });

  return {
    ...survey,
    sections: survey.sections && survey.sections.map(augmentSectionWithAnswers),
  };
};

/**
 * Transforms the react-hook-form data into the JSON shape that the endpoint expects to receive.
 */
export const buildResponsePayload = (data) => {
  const getFormattedAnswer = (question) => {
    if (!question.answer) {
      return {};
    }
    const { id, text_response, question_option_ids } = question.answer;
    return {
      id,
      text_response,
      question_option_ids: question_option_ids || [],
    };
  };
  const answers_attributes = data.sections.reduce(
    (accumulator, section) =>
      accumulator.concat(section.questions.map(getFormattedAnswer)),
    [],
  );
  return { response: { answers_attributes, submit: data.submit } };
};

const ResponseForm = (props) => {
  const {
    initialValues,
    onSubmit,
    readOnly,
    response,
    flags: { canSubmit, canModify, isResponseCreator },
  } = props;
  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: initialValues,
  });
  usePrompt(isDirty);

  const { fields } = useFieldArray({
    control,
    name: 'sections',
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues]);

  const handleSave = () => {
    const data = watch();
    onSubmit({ ...data, submit: false }, setError);
  };

  const renderSaveButton = () => {
    if (!canModify) {
      return null;
    }

    return (
      <Button
        color="primary"
        disabled={isSubmitting || !isDirty}
        onClick={handleSave}
        style={styles.formButton}
        variant="contained"
      >
        <FormattedMessage {...formTranslations.save} />
      </Button>
    );
  };

  const renderSubmitButton = () => {
    if (!isResponseCreator) {
      return null;
    }
    if (!response.submitted_at && !canSubmit) {
      return null;
    }

    const submitButtonTranslation = response.submitted_at
      ? responseFormTranslations.submitted
      : formTranslations.submit;

    return (
      <Button
        color="primary"
        disabled={isSubmitting || !!response.submitted_at}
        onClick={handleSubmit((data) =>
          onSubmit({ ...data, submit: true }, setError),
        )}
        style={styles.formButton}
        type="submit"
        variant="contained"
      >
        <FormattedMessage {...submitButtonTranslation} />
      </Button>
    );
  };

  return (
    <form encType="multipart/form-data" id="survey-response-form" noValidate>
      <ErrorText errors={errors} />
      {fields.map((section, sectionIndex) => {
        const disabled = isSubmitting || readOnly || !(canModify || canSubmit);
        return (
          <ResponseSection
            key={section.id}
            {...{ disabled, control, sectionIndex, section }}
          />
        );
      })}
      {!readOnly && renderSaveButton()}
      {!readOnly && renderSubmitButton()}
    </form>
  );
};

ResponseForm.propTypes = {
  readOnly: PropTypes.bool,
  flags: PropTypes.shape({
    canModify: PropTypes.bool.isRequired,
    canSubmit: PropTypes.bool.isRequired,
    isResponseCreator: PropTypes.bool.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
  }),
  response: responseShape,
  onSubmit: PropTypes.func,
  initialValues: PropTypes.object,
};

ResponseForm.defaultProps = {
  readOnly: false,
  response: {},
  // onSubmit will not be passed in when form is read-only
  onSubmit: () => {},
};

export default ResponseForm;
