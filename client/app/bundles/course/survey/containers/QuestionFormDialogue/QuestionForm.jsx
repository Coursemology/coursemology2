/* eslint-disable camelcase */
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { ListSubheader, TextField } from '@mui/material';
import { red } from '@mui/material/colors';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import ErrorText from 'lib/components/ErrorText';
import formTranslations from 'lib/translations/form';
import translations from 'course/survey/translations';
import { questionTypes } from 'course/survey/constants';
import QuestionFormOptions from './QuestionFormOptions';
import QuestionFormDeletedOptions from './QuestionFormDeletedOptions';

const styles = {
  questionType: {
    width: '50%',
  },
  numberOfResponsesDiv: {
    display: 'flex',
  },
  numberOfResponsesField: {
    style: { flex: 1 },
  },
  toggle: {
    marginTop: 10,
  },
  hint: {
    fontSize: 14,
    marginBottom: 12,
  },
};

const questionFormTranslations = defineMessages({
  required: {
    id: 'course.surveys.QuestionForm.required',
    defaultMessage: 'Required',
  },
  requiredHint: {
    id: 'course.surveys.QuestionForm.requiredHint',
    defaultMessage:
      'When selected, student must answer this question in order to complete the survey.',
  },
  gridView: {
    id: 'course.surveys.QuestionForm.gridView',
    defaultMessage: 'Grid View',
  },
  gridViewHint: {
    id: 'course.surveys.QuestionForm.gridViewHint',
    defaultMessage:
      'When selected, question options will be display as grid instead of a list. \
      This option is meant for questions with images as options.',
  },
  lessThanFilledOptions: {
    id: 'course.surveys.QuestionForm.lessThanFilledOptions',
    defaultMessage: 'Should be less than the valid option count',
  },
  noMoreThanFilledOptions: {
    id: 'course.surveys.QuestionForm.noMoreThanFilledOptions',
    defaultMessage: 'Should not be more than the valid option count',
  },
  atLeastOne: {
    id: 'course.surveys.QuestionForm.atLeastOne',
    defaultMessage: 'Should be at least 1',
  },
  atLeastOneOptions: {
    id: 'course.surveys.QuestionForm.atLeastOneOptions',
    defaultMessage: 'At least 1 option below is required',
  },
  atLeastZero: {
    id: 'course.surveys.QuestionForm.atLeastZero',
    defaultMessage: 'Should be at least 0',
  },
  notLessThanMin: {
    id: 'course.surveys.QuestionForm.notLessThanMin',
    defaultMessage: 'Should not be less than minimum',
  },
  noRestriction: {
    id: 'course.surveys.QuestionForm.noRestriction',
    defaultMessage: 'No Restriction',
  },
  optionCount: {
    id: 'course.surveys.QuestionForm.optionCount',
    defaultMessage: 'Valid Option Count',
  },
  optionsToKeep: {
    id: 'course.surveys.QuestionForm.optionsToKeep',
    defaultMessage: 'Options To Keep',
  },
  optionsToDelete: {
    id: 'course.surveys.QuestionForm.optionsToDelete',
    defaultMessage: 'Options To Delete',
  },
});

const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;

const questionOptions = [
  {
    value: TEXT,
    label: <FormattedMessage {...translations.textResponse} />,
  },
  {
    value: MULTIPLE_CHOICE,
    label: <FormattedMessage {...translations.multipleChoice} />,
  },
  {
    value: MULTIPLE_RESPONSE,
    label: <FormattedMessage {...translations.multipleResponse} />,
  },
];

const countFilledOptions = (options) =>
  options.filter(
    (option) => option && (option.option || option.file || option.image_url),
  ).length;

const validationSchema = yup.object({
  question_type: yup.string().required(formTranslations.required),
  description: yup.string().required(formTranslations.required),
  required: yup.bool(),
  grid_view: yup.bool(),
  min_options: yup
    .number()
    .transform((v) => (v === '' || Number.isNaN(v) ? null : v))
    .nullable()
    .test(
      'lessThanFilledOptions',
      questionFormTranslations.lessThanFilledOptions,
      function () {
        if (
          this.parent.question_type === MULTIPLE_RESPONSE &&
          this.parent.min_options
        ) {
          return !(
            this.parent.min_options >= countFilledOptions(this.parent.options)
          );
        }
        return true;
      },
    )
    .test('atLeastZero', questionFormTranslations.atLeastZero, function () {
      if (
        this.parent.question_type === MULTIPLE_RESPONSE &&
        this.parent.min_options
      ) {
        return !(this.parent.min_options < 0);
      }
      return true;
    }),
  max_options: yup
    .number()
    .transform((v) => (v === '' || Number.isNaN(v) ? null : v))
    .nullable()
    .test(
      'noMoreThanFilledOptions',
      questionFormTranslations.noMoreThanFilledOptions,
      function () {
        if (
          this.parent.question_type === MULTIPLE_RESPONSE &&
          this.parent.max_options
        ) {
          return !(
            this.parent.max_options > countFilledOptions(this.parent.options)
          );
        }
        return true;
      },
    )
    .test(
      'notLessThanMin',
      questionFormTranslations.notLessThanMin,
      function () {
        if (
          this.parent.question_type === MULTIPLE_RESPONSE &&
          this.parent.max_options
        ) {
          return !(
            this.parent.min_options &&
            this.parent.min_options > this.parent.max_options
          );
        }
        return true;
      },
    ),
  options: yup
    .array()
    .test('required', questionFormTranslations.atLeastOneOptions, function () {
      if (
        (this.parent.question_type === MULTIPLE_CHOICE ||
          this.parent.question_type === MULTIPLE_RESPONSE) &&
        countFilledOptions(this.parent.options) < 1
      ) {
        return false;
      }
      return true;
    }),
});

const QuestionForm = (props) => {
  const { disabled, initialValues, onSubmit } = props;
  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });
  const {
    fields: optionsFields,
    append: optionsAppend,
    remove: optionsRemove,
  } = useFieldArray({
    control,
    name: 'options',
  });

  const {
    fields: deletedOptionsFields,
    append: deletedOptionsAppend,
    remove: deletedOptionsRemove,
  } = useFieldArray({
    control,
    name: 'optionsToDelete',
  });

  const questionType = watch('question_type');
  const options = watch('options');
  const deletedOptions = watch('optionsToDelete');

  // When the values in any of the array options fields are changed,
  // 'fields' from useFieldArray are not updated but the internal values of options
  // are already updated in useForm. We then use watch to extract the updated options values
  // and update those to controlledFields as seen below.
  const controlledOptionsFields = optionsFields.map((field, index) => ({
    ...field,
    ...options[index],
  }));

  const controlledDeletedOptionsFields = deletedOptionsFields.map(
    (field, index) => ({
      ...field,
      ...deletedOptions[index],
    }),
  );

  useEffect(() => {
    if (optionsFields.length === 0) {
      optionsAppend({
        weight: null,
        option: '',
        image_url: '',
        image_name: '',
        file: null,
      });
    }
  }, [optionsFields.length === 0]);

  const isTextResponse = TEXT === questionType;
  const isMultipleChoice = MULTIPLE_CHOICE === questionType;
  const isMultipleResponse = MULTIPLE_RESPONSE === questionType;

  const renderOptionsToDelete = () => {
    if (deletedOptions && deletedOptions.length > 0) {
      return (
        <div>
          <ListSubheader disableSticky>
            <FormattedMessage {...questionFormTranslations.optionsToDelete} />
          </ListSubheader>
          <QuestionFormDeletedOptions
            fieldsConfig={{
              control,
              fields: controlledDeletedOptionsFields,
              append: deletedOptionsAppend,
              remove: deletedOptionsRemove,
            }}
            optionsAppend={optionsAppend}
            multipleChoice={isMultipleChoice}
            multipleResponse={isMultipleResponse}
          />
          <ListSubheader disableSticky>
            <FormattedMessage {...questionFormTranslations.optionsToKeep} />
          </ListSubheader>
        </div>
      );
    }
    return null;
  };

  const renderSpecificFields = () => {
    const numberOfFilledOptions = options ? countFilledOptions(options) : 0;

    return (
      <div>
        <Controller
          name="grid_view"
          control={control}
          render={({ field, fieldState }) => (
            <FormToggleField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={
                <FormattedMessage {...questionFormTranslations.gridView} />
              }
              style={styles.toggle}
            />
          )}
        />
        <p style={styles.hint}>
          <FormattedMessage {...questionFormTranslations.gridViewHint} />
        </p>

        <div style={styles.numberOfResponsesDiv}>
          <TextField
            disabled
            name="filled_options"
            value={numberOfFilledOptions}
            label={
              <FormattedMessage {...questionFormTranslations.optionCount} />
            }
            fullWidth
            style={{ marginBottom: 12, marginTop: 14, marginRight: 16 }}
            variant="standard"
          />
          {isMultipleResponse && (
            <>
              <Controller
                name="min_options"
                control={control}
                render={({ field, fieldState }) => (
                  <FormTextField
                    field={field}
                    fieldState={fieldState}
                    disabled={disabled}
                    fullWidth
                    label={<FormattedMessage {...translations.minOptions} />}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onWheel={(event) => event.currentTarget.blur()}
                    placeholder={
                      questionFormTranslations.noRestriction.defaultMessage
                    }
                    renderIf={isMultipleResponse}
                    style={styles.numberOfResponsesField}
                    type="number"
                    variant="standard"
                  />
                )}
              />
              <Controller
                name="max_options"
                control={control}
                render={({ field, fieldState }) => (
                  <FormTextField
                    field={field}
                    fieldState={fieldState}
                    disabled={disabled}
                    fullWidth
                    label={<FormattedMessage {...translations.maxOptions} />}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onWheel={(event) => event.currentTarget.blur()}
                    placeholder={
                      questionFormTranslations.noRestriction.defaultMessage
                    }
                    renderIf={isMultipleResponse}
                    style={styles.numberOfResponsesField}
                    type="number"
                    variant="standard"
                  />
                )}
              />
            </>
          )}
        </div>
        <div>
          {renderOptionsToDelete()}
          {errors.options && (
            <div style={{ color: red[500] }}>
              <FormattedMessage {...errors.options.message} />
            </div>
          )}
          <QuestionFormOptions
            fieldsConfig={{
              control,
              fields: controlledOptionsFields,
              append: optionsAppend,
              remove: optionsRemove,
            }}
            deletedOptionsAppend={deletedOptionsAppend}
            multipleChoice={isMultipleChoice}
            multipleResponse={isMultipleResponse}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <form
        encType="multipart/form-data"
        id="survey-section-question-form"
        noValidate
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
      >
        <ErrorText errors={errors} />
        <Controller
          name="question_type"
          control={control}
          render={({ field, fieldState }) => (
            <FormSelectField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.questionType} />}
              options={questionOptions}
              required
              style={styles.questionType}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <FormTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.questionText} />}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              minRows={4}
              multiline
              required
              variant="standard"
            />
          )}
        />
        <Controller
          name="required"
          control={control}
          render={({ field, fieldState }) => (
            <FormToggleField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={
                <FormattedMessage {...questionFormTranslations.required} />
              }
              style={styles.toggle}
            />
          )}
        />
        <p style={styles.hint}>
          <FormattedMessage {...questionFormTranslations.requiredHint} />
        </p>
        {!isTextResponse && renderSpecificFields()}
      </form>
    </>
  );
};

QuestionForm.propTypes = {
  disabled: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object.isRequired,
};

export default QuestionForm;
