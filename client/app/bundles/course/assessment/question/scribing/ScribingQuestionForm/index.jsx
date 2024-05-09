import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import * as yup from 'yup';

import ErrorText from 'lib/components/core/ErrorText';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import FormMultiSelectField from 'lib/components/form/fields/MultiSelectField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSingleFileInput, {
  ImagePreview,
} from 'lib/components/form/fields/SingleFileInput';
import FormTextField from 'lib/components/form/fields/TextField';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { createScribingQuestion, updateScribingQuestion } from '../operations';
import { dataShape } from '../propTypes';

import translations from './translations';
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
    .test('attachmentExists', formTranslations.required, (attachment) =>
      'file' in attachment ? Boolean(attachment.file) : true,
    ),
});

const ScribingQuestionForm = (props) => {
  const { data, initialValues, scribingId } = props;

  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  const dispatch = useAppDispatch();

  const question = data.question;
  const skillsOptions = question.skills;
  const onSubmit = scribingId
    ? (newData) =>
        dispatch(
          updateScribingQuestion(
            scribingId,
            newData,
            t(translations.resolveErrorsMessage),
            setError,
          ),
        )
    : (newData) =>
        dispatch(
          createScribingQuestion(
            newData,
            t(translations.resolveErrorsMessage),
            setError,
          ),
        );

  const submitButtonText = () =>
    data.isSubmitting
      ? t(translations.submittingMessage)
      : t(translations.submitButton);

  const renderExistingAttachment = () => (
    <div className={styles.row}>
      <label htmlFor="question_scribing_attachment">
        {t(translations.fileUploaded)}
      </label>

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
      noValidate
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
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            label={t(translations.titleFieldLabel)}
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
            fullWidth
            label={t(translations.descriptionFieldLabel)}
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
            fullWidth
            label={t(translations.staffOnlyCommentsFieldLabel)}
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
            label={t(translations.skillsFieldLabel)}
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
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            label={t(translations.maximumGradeFieldLabel)}
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
            control={control}
            name="attachment"
            render={({ field, fieldState }) => (
              <FormSingleFileInput
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.chooseFileButton)}
                previewComponent={ImagePreview}
                required
              />
            )}
          />
          <Typography variant="body2">
            {t(translations.scribingQuestionWarning)}
          </Typography>
        </>
      )}

      <Button
        className={styles.submitButton}
        color="primary"
        disabled={disabled}
        endIcon={data.isSubmitting ? <LoadingIndicator bare size={20} /> : null}
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
  data: dataShape.isRequired,
  initialValues: PropTypes.object,
  scribingId: PropTypes.string,
};

export default ScribingQuestionForm;
