import React, { PropTypes } from 'react';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { reduxForm, FieldArray, Form } from 'redux-form';
import RaisedButton from 'material-ui/RaisedButton';
import formTranslations from 'lib/translations/form';
import { questionTypes, formNames } from 'course/survey/constants';
import { responseShape } from 'course/survey/propTypes';
import ResponseSection from './ResponseSection';

const styles = {
  formButton: {
    marginRight: 10,
  },
};

const responseFormTranslations = defineMessages({
  selectAtLeast: {
    id: 'course.surveys.ResponseForm.selectAtLeast',
    defaultMessage: 'Please select at least {count} option(s).',
  },
  selectAtMost: {
    id: 'course.surveys.ResponseForm.selectAtMost',
    defaultMessage: 'Please select at most {count} option(s).',
  },
  submitted: {
    id: 'course.surveys.ResponseForm.submitted',
    defaultMessage: 'Submitted',
  },
});

const validateTextResponseAnswer = (formatMessage, answer) => {
  if (answer.question.required && !answer.text_response) {
    return { text_response: formatMessage(formTranslations.required) };
  }
  return {};
};

const validateMultipleChoiceAnswer = (formatMessage, answer) => {
  if (answer.question.required && !answer.selected_option) {
    return { selected_option: {
      _error: formatMessage(responseFormTranslations.selectAtLeast, { count: 1 }),
    } };
  }
  return {};
};

const validateMultipleResponseAnswer = (formatMessage, answer) => {
  const optionCount = answer.options.filter(option => option.selected).length;
  const minOptions = answer.question && answer.question.min_options;
  const maxOptions = answer.question && answer.question.max_options;
  if (!answer.question.required && optionCount === 0) { return {}; }
  if (minOptions && optionCount < minOptions) {
    return { options: {
      _error: formatMessage(responseFormTranslations.selectAtLeast, { count: minOptions }),
    } };
  }
  if (maxOptions && optionCount > maxOptions) {
    return { options: {
      _error: formatMessage(responseFormTranslations.selectAtMost, { count: maxOptions }),
    } };
  }
  return {};
};

const validate = (values, props) => {
  if (!values || !values.sections) { return {}; }

  const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
  const validatorMap = {
    [TEXT]: validateTextResponseAnswer,
    [MULTIPLE_CHOICE]: validateMultipleChoiceAnswer,
    [MULTIPLE_RESPONSE]: validateMultipleResponseAnswer,
  };

  const sectionsErrors = values.sections.map((section) => {
    const answersErrors = section.answers.map((answer) => {
      const validator = validatorMap[answer.question.question_type];
      if (validator) {
        return validator(props.intl.formatMessage, answer);
      }
      return {};
    });
    return { answers: answersErrors };
  });
  return { sections: sectionsErrors };
};

class ResponseForm extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool.isRequired,
    flags: PropTypes.shape({
      canModify: PropTypes.bool.isRequired,
      canSubmit: PropTypes.bool.isRequired,
      canUnsubmit: PropTypes.bool.isRequired,
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
        buttonStyle={styles.saveButton}
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
      handleSubmit, onSubmit, response, flags: { canSubmit, canModify, isSubmitting }, readOnly,
    } = this.props;

    return (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FieldArray
          name="sections"
          component={ResponseForm.renderSections}
          disabled={isSubmitting || readOnly || !(canModify || canSubmit)}
          {...{ response }}
        />
        <br />
        { !readOnly && this.renderSaveButton() }
        { !readOnly && this.renderSubmitButton() }
      </Form>
    );
  }
}

export default injectIntl(reduxForm({
  form: formNames.SURVEY_RESPONSE,
  validate,
  enableReinitialize: true,
})(ResponseForm));
