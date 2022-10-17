import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mui/material';
import ErrorText from 'lib/components/core/ErrorText';
import FormMultiSelectField from 'lib/components/form/fields/MultiSelectField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSingleFileInput, {
  ImagePreview,
} from 'lib/components/form/fields/SingleFileInput';
import FormTextField from 'lib/components/form/fields/TextField';
import formTranslations from 'lib/translations/form';

import styles from './ScribingQuestionForm.scss';
import translations from './ScribingQuestionForm.intl';

import { dataShape } from '../../propTypes';

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
        className={styles.uploadedImage}
        src={data.question.attachment_reference.image_url}
        alt={data.question.attachment_reference.name}
      />
    </div>
  );

  const disabled = data.isLoading || data.isSubmitting;

  return (
    <form
      encType="multipart/form-data"
      id="scribing-question-form"
      noValidate
      onSubmit={handleSubmit((newData) => onSubmit(newData, setError))}
    >
      <ErrorText errors={errors} />
      <Controller
        name="title"
        control={control}
        render={({ field, fieldState }) => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={<FormattedMessage {...translations.titleFieldLabel} />}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            variant="standard"
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <FormRichTextField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={<FormattedMessage {...translations.descriptionFieldLabel} />}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            variant="standard"
          />
        )}
      />
      <Controller
        name="staff_only_comments"
        control={control}
        render={({ field, fieldState }) => (
          <FormRichTextField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={
              <FormattedMessage {...translations.staffOnlyCommentsFieldLabel} />
            }
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            variant="standard"
          />
        )}
      />
      <Controller
        name="skill_ids"
        control={control}
        render={({ field, fieldState }) => (
          <FormMultiSelectField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={<FormattedMessage {...translations.skillsFieldLabel} />}
            options={skillsOptions}
          />
        )}
      />
      <Controller
        name="maximum_grade"
        control={control}
        render={({ field, fieldState }) => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            fullWidth
            label={
              <FormattedMessage {...translations.maximumGradeFieldLabel} />
            }
            InputLabelProps={{
              shrink: true,
            }}
            onWheel={(event) => event.currentTarget.blur()}
            required
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
            name="attachment"
            control={control}
            render={({ field, fieldState }) => (
              <FormSingleFileInput
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={<FormattedMessage {...translations.chooseFileButton} />}
                previewComponent={ImagePreview}
                required
              />
            )}
          />
          <div className={styles.warningText}>
            <FormattedMessage {...translations.scribingQuestionWarning} />
          </div>
        </>
      )}

      <Button
        variant="contained"
        className={styles.submitButton}
        color="primary"
        disabled={disabled}
        endIcon={
          data.isSubmitting ? (
            <i className="fa fa-spinner fa-lg fa-spin" />
          ) : null
        }
        type="submit"
        style={{ marginBottom: '1em' }}
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
