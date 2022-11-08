import { FC, useEffect } from 'react';
import { defineMessages } from 'react-intl';
import { Controller, useForm, UseFormSetError } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mui/material';
import ErrorText from 'lib/components/core/ErrorText';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import useTranslation from 'lib/hooks/useTranslation';
import { ForumFormData } from 'types/course/forums';

interface Props {
  handleClose: (isDirty: boolean) => void;
  onSubmit: (
    data: ForumFormData,
    setError: UseFormSetError<ForumFormData>,
  ) => void;
  setIsDirty?: (value: boolean) => void;
  initialValues: ForumFormData;
}

const translations = defineMessages({
  name: {
    id: 'course.forum.form.name',
    defaultMessage: 'Name',
  },
  description: {
    id: 'course.forum.form.description',
    defaultMessage: 'Description',
  },
  forumTopicsAutoSubscribe: {
    id: 'course.forum.form.forumTopicsAutoSubscribe',
    defaultMessage:
      'Enable auto-subscription to a forum topic when a user creates the topic, new posts or replies.',
  },
});

const validationSchema = yup.object({
  name: yup.string().required(formTranslations.required),
  description: yup.string().nullable(),
  forumTopicsAutoSubscribe: yup.bool(),
});

const ForumForm: FC<Props> = (props) => {
  const { handleClose, initialValues, onSubmit, setIsDirty } = props;
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ForumFormData>({
    defaultValues: initialValues,
    resolver: yupResolver<yup.AnyObjectSchema>(validationSchema),
  });

  useEffect(() => {
    if (setIsDirty) {
      if (isDirty) {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    }
  }, [isDirty]);

  const disabled = isSubmitting;

  const actionButtons = (
    <div className="mt-2 flex justify-end space-x-2">
      <Button
        color="secondary"
        className="btn-cancel"
        disabled={disabled}
        key="forum-form-cancel-button"
        onClick={(): void => handleClose(isDirty)}
      >
        {t(formTranslations.cancel)}
      </Button>
      {initialValues.id ? (
        <Button
          variant="contained"
          color="primary"
          className="btn-submit"
          disabled={disabled || !isDirty}
          form="forum-form"
          key="forum-form-update-button"
          type="submit"
        >
          {t(formTranslations.update)}
        </Button>
      ) : (
        <Button
          color="primary"
          className="btn-submit"
          disabled={disabled || !isDirty}
          form="forum-form"
          key="forum-form-submit-button"
          type="submit"
        >
          {t(formTranslations.submit)}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <form
        encType="multipart/form-data"
        id="forum-form"
        noValidate
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
      >
        <ErrorText errors={errors} />
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={t(translations.name)}
              // @ts-ignore: component is still written in JS
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              required
              variant="standard"
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormRichTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={t(translations.description)}
              // @ts-ignore: component is still written in JS
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              variant="standard"
            />
          )}
        />
        <Controller
          name="forumTopicsAutoSubscribe"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormToggleField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={t(translations.forumTopicsAutoSubscribe)}
            />
          )}
        />
        {actionButtons}
      </form>
    </>
  );
};

export default ForumForm;
