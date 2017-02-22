import React, { PropTypes } from 'react';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { reduxForm, FieldArray, Form } from 'redux-form';
import RaisedButton from 'material-ui/RaisedButton';
import formTranslations from 'lib/translations/form';
import { questionTypes, formNames } from '../../constants';
import { responseShape, surveyShape } from '../../propTypes';
import ResponseAnswer from './ResponseAnswer';

const styles = {
  submitButton: {
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
  if (answer.required && !answer.text_response) {
    return { text_response: formatMessage(formTranslations.required) };
  }
  return {};
};

const validateMultipleChoiceAnswer = (formatMessage, answer) => {
  if (answer.required && !answer.selected_option) {
    return { selected_option: {
      _error: formatMessage(responseFormTranslations.selectAtLeast, { count: 1 }),
    } };
  }
  return {};
};

const validateMultipleResponseAnswer = (formatMessage, answer) => {
  const optionCount = answer.options.filter(option => option.selected).length;
  if (!answer.required && optionCount === 0) { return {}; }
  if (answer.min_options && optionCount < answer.min_options) {
    return { options: {
      _error: formatMessage(responseFormTranslations.selectAtLeast, { count: answer.min_options }),
    } };
  }
  if (answer.max_options && optionCount > answer.max_options) {
    return { options: {
      _error: formatMessage(responseFormTranslations.selectAtMost, { count: answer.max_options }),
    } };
  }
  return {};
};

const validate = (values, props) => {
  if (!values || !values.answers) { return {}; }

  const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
  const validatorMap = {
    [TEXT]: validateTextResponseAnswer,
    [MULTIPLE_CHOICE]: validateMultipleChoiceAnswer,
    [MULTIPLE_RESPONSE]: validateMultipleResponseAnswer,
  };
  const answerErrors = values.answers.map((answer) => {
    const validator = validatorMap[answer.question_type.toString()];
    if (validator) {
      return validator(props.intl.formatMessage, answer);
    }
    return {};
  });

  return { answers: answerErrors };
};


class ResponseForm extends React.Component {
  static propTypes = {
    survey: surveyShape.isRequired,
    response: responseShape.isRequired,
    onSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired,

    handleSubmit: PropTypes.func.isRequired,
  };

  static renderAnswers(props) {
    const { fields, questionsHash } = props;

    return (
      <div>
        {fields.map((member, index) => {
          const answer = fields.get(index);
          const question = questionsHash[answer.question_id];
          return (
            <ResponseAnswer
              key={answer.id}
              {...{ question, member, index }}
            />
          );
        })}
      </div>
    );
  }

  render() {
    const { handleSubmit, onSubmit, response, survey, pristine } = this.props;

    const questionsHash = {};
    if (survey.questions) {
      survey.questions.forEach((question) => {
        questionsHash[question.id] = question;
      });
    }

    const submitButtonTranslation =
      response.submitted_at ? responseFormTranslations.submitted : formTranslations.submit;

    return (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FieldArray
          name="answers"
          component={ResponseForm.renderAnswers}
          {...{ questionsHash }}
        />
        <br />
        <RaisedButton
          type="submit"
          primary
          label={<FormattedMessage {...formTranslations.save} />}
          style={styles.submitButton}
          disabled={!!pristine}
        />
        <RaisedButton
          type="submit"
          primary
          label={<FormattedMessage {...submitButtonTranslation} />}
          onClick={handleSubmit(data => onSubmit({ ...data, submit: true }))}
          style={styles.submitButton}
          disabled={!!response.submitted_at}
        />
      </Form>
    );
  }
}

export default injectIntl(reduxForm({
  form: formNames.SURVEY_RESPONSE,
  validate,
  enableReinitialize: true,
})(ResponseForm));
