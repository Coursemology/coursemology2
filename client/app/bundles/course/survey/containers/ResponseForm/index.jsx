/* eslint-disable camelcase */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { reduxForm, FieldArray, Form, getFormValues } from 'redux-form';
// import { Prompt } from 'react-router-dom';
import { Button } from '@mui/material';
import formTranslations from 'lib/translations/form';
import { formNames } from 'course/survey/constants';
import { responseShape } from 'course/survey/propTypes';
import ResponseSection from './ResponseSection';

const styles = {
  formButton: {
    marginRight: 10,
  },
};

const responseFormTranslations = defineMessages({
  submitted: {
    id: 'course.surveys.ResponseForm.submitted',
    defaultMessage: 'Submitted',
  },
});

/**
 * Merges response answers into survey data to form initialValues for redux-form.
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
 * Transforms the redux-form data into the JSON shape that the endpoint expects to receive.
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

class ResponseForm extends Component {
  static renderSections(props) {
    const { fields, disabled } = props;
    return (
      <>
        {fields.map((member, index) => {
          const section = fields.get(index);
          return (
            <ResponseSection
              key={section.id}
              {...{ member, index, fields, disabled }}
            />
          );
        })}
      </>
    );
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.handleUnload);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleUnload);
  }

  handleUnload = (e) => {
    if (!this.props.pristine) {
      e.preventDefault();
      // For Chrome to show warning when navigating away from the page, we need to
      // indicate the returnValue below.
      e.returnValue = '';
      return '';
    }
    return null;
  };

  renderSaveButton() {
    const {
      pristine,
      onSubmit,
      formValues,
      flags: { canModify, isSubmitting },
    } = this.props;
    if (!canModify) {
      return null;
    }

    return (
      <Button
        variant="contained"
        color="primary"
        disabled={isSubmitting || pristine}
        onClick={() => onSubmit({ ...formValues, submit: false })}
        style={styles.formButton}
        type="submit"
      >
        <FormattedMessage {...formTranslations.save} />
      </Button>
    );
  }

  renderSubmitButton() {
    const {
      handleSubmit,
      onSubmit,
      response,
      flags: { canSubmit, isResponseCreator, isSubmitting },
    } = this.props;

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
        variant="contained"
        color="primary"
        disabled={isSubmitting || !!response.submitted_at}
        onClick={handleSubmit((data) => onSubmit({ ...data, submit: true }))}
        style={styles.formButton}
        type="submit"
      >
        <FormattedMessage {...submitButtonTranslation} />
      </Button>
    );
  }

  // renderNavigateAwayWarning() {
  //   const isDirty = !this.props.pristine;

  //   return (
  //     <Prompt
  //       when={isDirty}
  //       message={(action) =>
  //         // Note: POP refers to back action in a browser.
  //         action === 'POP'
  //       }
  //     />
  //   );
  // }

  render() {
    const {
      handleSubmit,
      onSubmit,
      flags: { canSubmit, canModify, isSubmitting },
      readOnly,
    } = this.props;

    return (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FieldArray
          name="sections"
          component={ResponseForm.renderSections}
          disabled={isSubmitting || readOnly || !(canModify || canSubmit)}
        />
        <br />
        {!readOnly && this.renderSaveButton()}
        {!readOnly && this.renderSubmitButton()}
        {/* {this.renderNavigateAwayWarning()} */}
      </Form>
    );
  }
}

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
  pristine: PropTypes.bool.isRequired,
  formValues: PropTypes.shape({}),

  handleSubmit: PropTypes.func.isRequired,
};

ResponseForm.defaultProps = {
  readOnly: false,
  response: {},
  // onSubmit will not be passed in when form is read-only
  onSubmit: () => {},
};

export default reduxForm({
  form: formNames.SURVEY_RESPONSE,
  enableReinitialize: true,
})(
  connect((state) => ({
    formValues: getFormValues(formNames.SURVEY_RESPONSE)(state),
  }))(ResponseForm),
);
