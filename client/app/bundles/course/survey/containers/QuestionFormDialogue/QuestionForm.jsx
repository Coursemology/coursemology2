import { useEffect } from 'react';
import useEmitterFactory from 'react-emitter-factory';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { ListSubheader, TextField } from '@mui/material';
import { red } from '@mui/material/colors';
import PropTypes from 'prop-types';
import * as yup from 'yup';

import { questionTypes } from 'course/survey/constants';
import translations from 'course/survey/translations';
import ErrorText from 'lib/components/core/ErrorText';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import formTranslations from 'lib/translations/form';

import QuestionFormDeletedOptions from './QuestionFormDeletedOptions';
import QuestionFormOptions from './QuestionFormOptions';

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
  const { disabled, initialValues, onSubmit, intl } = props;
  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isDirty },
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

  useEmitterFactory(
    props,
    {
      isDirty,
    },
    [isDirty],
  );

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
    // To add an option field by default when all other option fields are deleted.
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
    const shouldRenderOptionsToDelete =
      deletedOptions && deletedOptions.length > 0;
    if (!shouldRenderOptionsToDelete) {
      return null;
    }
    return (
      <div>
        <ListSubheader disableSticky={true}>
          <FormattedMessage {...questionFormTranslations.optionsToDelete} />
        </ListSubheader>
        <QuestionFormDeletedOptions
          fieldsConfig={{
            control,
            fields: controlledDeletedOptionsFields,
            append: deletedOptionsAppend,
            remove: deletedOptionsRemove,
          }}
          multipleChoice={isMultipleChoice}
          multipleResponse={isMultipleResponse}
          optionsAppend={optionsAppend}
        />
        <ListSubheader disableSticky={true}>
          <FormattedMessage {...questionFormTranslations.optionsToKeep} />
        </ListSubheader>
      </div>
    );
  };

  const renderSpecificFields = () => {
    const numberOfFilledOptions = options ? countFilledOptions(options) : 0;

    return (
      <div>
        <Controller
          control={control}
          name="grid_view"
          render={({ field, fieldState }) => (
            <FormToggleField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
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
            disabled={true}
            fullWidth={true}
            label={
              <FormattedMessage {...questionFormTranslations.optionCount} />
            }
            name="filled_options"
            style={{ marginBottom: 12, marginTop: 14, marginRight: 16 }}
            value={numberOfFilledOptions}
            variant="standard"
          />
          {isMultipleResponse && (
            <>
              <Controller
                control={control}
                name="min_options"
                render={({ field, fieldState }) => (
                  <FormTextField
                    disabled={disabled}
                    field={field}
                    fieldState={fieldState}
                    fullWidth={true}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    label={<FormattedMessage {...translations.minOptions} />}
                    onWheel={(event) => event.currentTarget.blur()}
                    placeholder={intl.formatMessage(
                      questionFormTranslations.noRestriction,
                    )}
                    renderIf={isMultipleResponse}
                    style={styles.numberOfResponsesField}
                    type="number"
                    variant="standard"
                  />
                )}
              />
              <Controller
                control={control}
                name="max_options"
                render={({ field, fieldState }) => (
                  <FormTextField
                    disabled={disabled}
                    field={field}
                    fieldState={fieldState}
                    fullWidth={true}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    label={<FormattedMessage {...translations.maxOptions} />}
                    onWheel={(event) => event.currentTarget.blur()}
                    placeholder={intl.formatMessage(
                      questionFormTranslations.noRestriction,
                    )}
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
            deletedOptionsAppend={deletedOptionsAppend}
            fieldsConfig={{
              control,
              fields: controlledOptionsFields,
              append: optionsAppend,
              remove: optionsRemove,
            }}
            multipleChoice={isMultipleChoice}
            multipleResponse={isMultipleResponse}
          />
        </div>
      </div>
    );
  };

  return (
    <form
      encType="multipart/form-data"
      id="survey-section-question-form"
      noValidate={true}
      onSubmit={handleSubmit((data) => onSubmit(data, setError))}
    >
      <ErrorText errors={errors} />
      <Controller
        control={control}
        name="question_type"
        render={({ field, fieldState }) => (
          <FormSelectField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            label={<FormattedMessage {...translations.questionType} />}
            options={questionOptions}
            required={true}
            style={styles.questionType}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <FormTextField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            fullWidth={true}
            InputLabelProps={{
              shrink: true,
            }}
            label={<FormattedMessage {...translations.questionText} />}
            minRows={4}
            multiline={true}
            required={true}
            variant="standard"
          />
        )}
      />
      <Controller
        control={control}
        name="required"
        render={({ field, fieldState }) => (
          <FormToggleField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            label={<FormattedMessage {...questionFormTranslations.required} />}
            style={styles.toggle}
          />
        )}
      />
      <p style={styles.hint}>
        <FormattedMessage {...questionFormTranslations.requiredHint} />
      </p>
      {!isTextResponse && renderSpecificFields()}
    </form>
  );
};

QuestionForm.propTypes = {
  disabled: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(QuestionForm);
