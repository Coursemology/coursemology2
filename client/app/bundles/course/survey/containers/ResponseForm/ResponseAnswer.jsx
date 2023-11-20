import { Controller } from 'react-hook-form';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { questionTypes } from 'course/survey/constants';
import FormTextField from 'lib/components/form/fields/TextField';
import formTranslations from 'lib/translations/form';

import MultipleChoiceOptionsField from './components/MultipleChoiceOptionsField';
import MultipleResponseOptionsField from './components/MultipleResponseOptionsField';

const responseFormTranslations = defineMessages({
  selectAtLeast: {
    id: 'course.survey.ResponseForm.ResponseAnswer.selectAtLeast',
    defaultMessage: 'Please select at least {count} option(s).',
  },
  selectAtMost: {
    id: 'course.survey.ResponseForm.ResponseAnswer.selectAtMost',
    defaultMessage: 'Please select at most {count} option(s).',
  },
});

const checkTextResponseRequired = (value, question, intl) =>
  question.required && !value
    ? intl.formatMessage(formTranslations.required)
    : true;

const checkMultipleChoiceRequired = (value, question, intl) =>
  question.required && (!value || value.length < 1)
    ? intl.formatMessage(responseFormTranslations.selectAtLeast, { count: 1 })
    : true;

const checkQuantitySelected = (options, question, intl) => {
  const { required, max_options: maxOptions } = question;
  const minOptions = question.min_options || 1;
  const optionCount = options.length;
  // Skip checks if question is not required and student doesn't intend to answer it.
  if (!required && optionCount === 0) {
    return true;
  }

  if (minOptions && optionCount < minOptions) {
    return intl.formatMessage(responseFormTranslations.selectAtLeast, {
      count: minOptions,
    });
  }
  if (maxOptions && optionCount > maxOptions) {
    return intl.formatMessage(responseFormTranslations.selectAtMost, {
      count: maxOptions,
    });
  }

  return true;
};

const renderTextResponseField = (props) => {
  const { control, disabled, intl, question, questionIndex, sectionIndex } =
    props;

  return (
    <Controller
      control={control}
      name={`sections.${sectionIndex}.questions.${questionIndex}.answer.text_response`}
      render={({ field, fieldState }) => (
        <FormTextField
          disabled={disabled}
          field={field}
          fieldState={fieldState}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          multiline
          variant="standard"
        />
      )}
      rules={{ validate: (v) => checkTextResponseRequired(v, question, intl) }}
    />
  );
};

const renderMultipleChoiceField = (props) => {
  const { control, disabled, intl, question, questionIndex, sectionIndex } =
    props;

  return (
    <Controller
      control={control}
      name={`sections.${sectionIndex}.questions.${questionIndex}.answer.question_option_ids`}
      render={({ field, fieldState }) => (
        <MultipleChoiceOptionsField
          disabled={disabled}
          field={field}
          fieldState={fieldState}
          question={question}
        />
      )}
      rules={{
        validate: (v) => checkMultipleChoiceRequired(v, question, intl),
      }}
    />
  );
};

const renderMultipleResponseField = (props) => {
  const { control, disabled, intl, question, questionIndex, sectionIndex } =
    props;

  return (
    <Controller
      control={control}
      name={`sections.${sectionIndex}.questions.${questionIndex}.answer.question_option_ids`}
      render={({ field, fieldState }) => (
        <MultipleResponseOptionsField
          disabled={disabled}
          field={field}
          fieldState={fieldState}
          question={question}
        />
      )}
      rules={{
        validate: (v) => checkQuantitySelected(v, question, intl),
      }}
    />
  );
};

const ResponseAnswer = (props) => {
  const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
  const { control, disabled, intl, question, questionIndex, sectionIndex } =
    props;
  if (!question) {
    return <div />;
  }
  const renderer = {
    [TEXT]: renderTextResponseField({
      control,
      disabled,
      intl,
      question,
      questionIndex,
      sectionIndex,
    }),
    [MULTIPLE_CHOICE]: renderMultipleChoiceField({
      control,
      disabled,
      intl,
      question,
      questionIndex,
      sectionIndex,
    }),
    [MULTIPLE_RESPONSE]: renderMultipleResponseField({
      control,
      disabled,
      intl,
      question,
      questionIndex,
      sectionIndex,
    }),
  }[question.question_type];
  if (!renderer) {
    return <div />;
  }
  return renderer;
};

ResponseAnswer.propTypes = {
  control: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
  intl: PropTypes.object,
  question: PropTypes.object,
  questionIndex: PropTypes.number.isRequired,
  sectionIndex: PropTypes.number.isRequired,
};

export default injectIntl(ResponseAnswer);
