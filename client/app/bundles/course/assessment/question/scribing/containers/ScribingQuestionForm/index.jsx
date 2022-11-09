import { Controller, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';
import * as yup from 'yup';

import ErrorText from 'lib/components/core/ErrorText';
import FormMultiSelectField from 'lib/components/form/fields/MultiSelectField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSingleFileInput, {
  ImagePreview,
} from 'lib/components/form/fields/SingleFileInput';
import FormTextField from 'lib/components/form/fields/TextField';
import formTranslations from 'lib/translations/form';

import { dataShape } from '../../propTypes';

import translations from './ScribingQuestionForm.intl';
import styles from './ScribingQuestionForm.scss';

const validationSchema = yup.object({
  title: yup.string().nullable(),
  description: yup.string().nullable(),
  staff_only_comments: yup.string().nullable(),
  skills: yup.array().nullable(),
  maximum_grade: yup
    .number()
    .min(0, translations.positiveNumberValidationError)
    .max(1000, translations.valueMoreThanEqual1000Error)
    .typeError(formTranslations.required)
    .required(formTranslations.required),
  attachment: yup
    .object()
    .test(
      'attachmentExists',
      formTranslations.required,
      (attachment) => attachment && attachment.file,
    ),
});

const ScribingQuestionForm = (props) => {
  const {
    actions: { createScribingQuestion, updateScribingQuestion },
    data,
    initialValues,
    intl,
    scribingId,
  } = props;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  const question = data.question;
  const skillsOptions = question.skills;
  const onSubmit = scribingId
    ? (newData) =>
        updateScribingQuestion(
          scribingId,
          newData,
          intl.formatMessage(translations.resolveErrorsMessage),
          setError,
        )
    : (newData) =>
        createScribingQuestion(
          newData,
          intl.formatMessage(translations.resolveErrorsMessage),
          setError,
        );
  const submitButtonText = () =>
    data.isSubmitting
      ? intl.formatMessage(translations.submittingMessage)
      : intl.formatMessage(translations.submitButton);

  const renderExistingAttachment = () => (
    <div className={styles.row}>
      <label htmlFor="question_scribing_attachment">File uploaded:</label>
      <img
        alt={data.question.attachment_reference.name}
        className={styles.uploadedImage}
        src={data.question.attachment_reference.image_url}
      />
    </div>
  );

  const disabled = data.isLoading || data.isSubmitting;

  return (
    <form
      encType="multipart/form-data"
      id="scribing-question-form"
      noValidate={true}
      onSubmit={handleSubmit((newData) => onSubmit(newData, setError))}
    >
      <ErrorText errors={errors} />
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormTextField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            fullWidth={true}
            InputLabelProps={{
              shrink: true,
            }}
            label={<FormattedMessage {...translations.titleFieldLabel} />}
            variant="standard"
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <FormRichTextField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            fullWidth={true}
            InputLabelProps={{
              shrink: true,
            }}
            label={<FormattedMessage {...translations.descriptionFieldLabel} />}
            variant="standard"
          />
        )}
      />
      <Controller
        control={control}
        name="staff_only_comments"
        render={({ field, fieldState }) => (
          <FormRichTextField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            fullWidth={true}
            InputLabelProps={{
              shrink: true,
            }}
            label={
              <FormattedMessage {...translations.staffOnlyCommentsFieldLabel} />
            }
            variant="standard"
          />
        )}
      />
      <Controller
        control={control}
        name="skill_ids"
        render={({ field, fieldState }) => (
          <FormMultiSelectField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            label={<FormattedMessage {...translations.skillsFieldLabel} />}
            options={skillsOptions}
          />
        )}
      />
      <Controller
        control={control}
        name="maximum_grade"
        render={({ field, fieldState }) => (
          <FormTextField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            fullWidth={true}
            InputLabelProps={{
              shrink: true,
            }}
            label={
              <FormattedMessage {...translations.maximumGradeFieldLabel} />
            }
            onWheel={(event) => event.currentTarget.blur()}
            required={true}
            type="number"
            variant="standard"
          />
        )}
      />

      {data.question.attachment_reference &&
      data.question.attachment_reference.name ? (
        renderExistingAttachment()
      ) : (
        <>
          <Controller
            control={control}
            name="attachment"
            render={({ field, fieldState }) => (
              <FormSingleFileInput
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={<FormattedMessage {...translations.chooseFileButton} />}
                previewComponent={ImagePreview}
                required={true}
              />
            )}
          />
          <div className={styles.warningText}>
            <FormattedMessage {...translations.scribingQuestionWarning} />
          </div>
        </>
      )}

      <Button
        className={styles.submitButton}
        color="primary"
        disabled={disabled}
        endIcon={
          data.isSubmitting ? (
            <i className="fa fa-spinner fa-lg fa-spin" />
          ) : null
        }
        style={{ marginBottom: '1em' }}
        type="submit"
        variant="contained"
      >
        {submitButtonText()}
      </Button>
    </form>
  );
};

ScribingQuestionForm.propTypes = {
  actions: PropTypes.shape({
    createScribingQuestion: PropTypes.func.isRequired,
    fetchSkills: PropTypes.func.isRequired,
    fetchScribingQuestion: PropTypes.func.isRequired,
    updateScribingQuestion: PropTypes.func.isRequired,
  }),
  data: dataShape.isRequired,
  initialValues: PropTypes.object,
  intl: PropTypes.object.isRequired,
  scribingId: PropTypes.string,
};

export default ScribingQuestionForm;
