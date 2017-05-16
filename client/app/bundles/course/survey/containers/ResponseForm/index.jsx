/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { reduxForm, FieldArray, Form } from 'redux-form';
import RaisedButton from 'material-ui/RaisedButton';
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
  if (!survey || !response || !response.answers) { return {}; }

  const answersHash = {};
  response.answers.forEach((answer) => { answersHash[answer.question_id] = answer; });

  const augmentQuestionWithAnswer = question => (
    { ...question, answer: answersHash[question.id] }
  );
  const augmentSectionWithAnswers = section => (
    { ...section, questions: section.questions && section.questions.map(augmentQuestionWithAnswer) }
  );

  return { ...survey, sections: survey.sections && survey.sections.map(augmentSectionWithAnswers) };
};

/**
 * Transforms the redux-form data into the JSON shape that the endpoint expects to receive.
 */
export const buildResponsePayload = (data) => {
  const getFormattedAnswer = (question) => {
    if (!question.answer) { return {}; }
    const { id, text_response, question_option_ids } = question.answer;
    return { id, text_response, question_option_ids: question_option_ids || [] };
  };
  const answers_attributes = data.sections.reduce((accumulator, section) => (
    accumulator.concat(section.questions.map(getFormattedAnswer))
  ), []);
  return { response: { answers_attributes, submit: data.submit } };
};

class ResponseForm extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool.isRequired,
    flags: PropTypes.shape({
      canModify: PropTypes.bool.isRequired,
      canSubmit: PropTypes.bool.isRequired,
      isResponseCreator: PropTypes.bool.isRequired,
      isSubmitting: PropTypes.bool.isRequired,
    }),
    response: responseShape.isRequired,
    onSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired,

    handleSubmit: PropTypes.func.isRequired,
  };

  static defaultProps = {
    readOnly: false,
    response: {},
    // onSubmit will not be passed in when form is read-only
    onSubmit: () => {},
  }

  static renderSections(props) {
    const { fields, disabled } = props;
    return (
      <div>
        {
          fields.map((member, index) => {
            const section = fields.get(index);
            return (
              <ResponseSection
                key={section.id}
                {...{ member, index, fields, disabled }}
              />
            );
          })
        }
      </div>
    );
  }

  renderSaveButton() {
    const { pristine, flags: { canModify, isSubmitting } } = this.props;
    if (!canModify) { return null; }

    return (
      <RaisedButton
        style={styles.formButton}
        type="submit"
        primary
        label={<FormattedMessage {...formTranslations.save} />}
        disabled={isSubmitting || pristine}
      />
    );
  }

  renderSubmitButton() {
    const {
      handleSubmit, onSubmit, response, flags: { canSubmit, isResponseCreator, isSubmitting },
    } = this.props;

    if (!isResponseCreator) { return null; }
    if (!response.submitted_at && !canSubmit) { return null; }

    const submitButtonTranslation =
      response.submitted_at ? responseFormTranslations.submitted : formTranslations.submit;

    return (
      <RaisedButton
        style={styles.formButton}
        type="submit"
        primary
        label={<FormattedMessage {...submitButtonTranslation} />}
        onTouchTap={handleSubmit(data => onSubmit({ ...data, submit: true }))}
        disabled={isSubmitting || !!response.submitted_at}
      />
    );
  }

  render() {
    const {
      handleSubmit, onSubmit, flags: { canSubmit, canModify, isSubmitting }, readOnly,
    } = this.props;

    return (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FieldArray
          name="sections"
          component={ResponseForm.renderSections}
          disabled={isSubmitting || readOnly || !(canModify || canSubmit)}
        />
        <br />
        { !readOnly && this.renderSaveButton() }
        { !readOnly && this.renderSubmitButton() }
      </Form>
    );
  }
}

export default reduxForm({
  form: formNames.SURVEY_RESPONSE,
  enableReinitialize: true,
})(ResponseForm);
