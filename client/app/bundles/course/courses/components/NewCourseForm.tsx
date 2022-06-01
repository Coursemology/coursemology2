import { FC, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mui/material';
import ErrorText from 'lib/components/ErrorText';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';

interface Props {
  handleClose: (isDirty: boolean) => any;
  onSubmit: (data: any, setError: unknown) => void;
  setIsDirty?: (value: boolean) => void;
  initialValues?: Object;
}

interface IFormInputs {
  title: string;
  description: string;
}

const translations = defineMessages({
  title: {
    id: 'course.form.title',
    defaultMessage: 'Title',
  },
  description: {
    id: 'course.form.description',
    defaultMessage: 'Description',
  },
});

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  description: yup.string().nullable(),
});

const NewCourseForm: FC<Props> = (props) => {
  const { handleClose, initialValues, onSubmit, setIsDirty } = props;
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<IFormInputs>({
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

  return (
    <>
      <form
        encType="multipart/form-data"
        id="new-course-form"
        noValidate
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
      >
        <ErrorText errors={errors} />
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.title} />}
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
              label={<FormattedMessage {...translations.description} />}
              // @ts-ignore: component is still written in JS
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              variant="standard"
            />
          )}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '8px',
          }}
        >
          <Button
            color="primary"
            className="btn-cancel"
            disabled={disabled}
            key="new-course-form-cancel-button"
            onClick={(): void => handleClose(isDirty)}
          >
            <FormattedMessage {...formTranslations.cancel} />
          </Button>
          <Button
            color="primary"
            className="btn-submit"
            disabled={disabled || !isDirty}
            form="new-course-form"
            key="new-course-form-submit-button"
            type="submit"
          >
            <FormattedMessage {...formTranslations.submit} />
          </Button>
        </div>
      </form>
    </>
  );
};

export default NewCourseForm;
