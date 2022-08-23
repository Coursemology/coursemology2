import { FC, useEffect } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button } from '@mui/material';

import ErrorText from 'lib/components/ErrorText';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormSingleFileInput, {
  FilePreview,
} from 'lib/components/form/fields/SingleFileInput';

import { MaterialFormData } from 'types/course/material/folders';

interface Props extends WrappedComponentProps {
  editing: boolean;
  handleClose: (isDirty: boolean) => void;
  onSubmit: (data: MaterialFormData, setError: unknown) => void;
  setIsDirty: (value: boolean) => void;
  initialValues: Object;
  isSubmitting: boolean;
}

interface IFormInputs {
  name: string;
  description: string;
  file: { name: string; url: string };
}

const translations = defineMessages({
  name: {
    id: 'course.materials.folders.materialForm.name',
    defaultMessage: 'Name',
  },
  description: {
    id: 'course.materials.folders.materialForm.description',
    defaultMessage: 'Description',
  },
  fileHelpMessage: {
    id: 'course.materials.folders.materialForm.description',
    defaultMessage: '* Only upload a file if you want to update it',
  },
});

const validationSchema = yup.object({
  name: yup.string().required(formTranslations.required),
  description: yup.string().nullable(),
});

const MaterialForm: FC<Props> = (props) => {
  const {
    intl,
    editing,
    handleClose,
    initialValues,
    onSubmit,
    setIsDirty,
    isSubmitting,
  } = props;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<IFormInputs>({
    defaultValues: initialValues,
    resolver: yupResolver<yup.AnyObjectSchema>(validationSchema),
  });

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty]);

  const disabled = isSubmitting;

  const actionButtons = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: '20px',
      }}
    >
      <Button
        color="primary"
        className="btn-cancel"
        disabled={disabled}
        key="material-form-cancel-button"
        onClick={(): void => handleClose(isDirty)}
      >
        <FormattedMessage {...formTranslations.cancel} />
      </Button>
      {editing ? (
        <Button
          id="material-form-update-button"
          variant="contained"
          color="primary"
          className="btn-submit"
          disabled={disabled || !isDirty}
          form="material-form"
          key="material-form-update-button"
          type="submit"
        >
          <FormattedMessage {...formTranslations.update} />
        </Button>
      ) : (
        <Button
          id="material-form-submit-button"
          color="primary"
          className="btn-submit"
          disabled={disabled || !isDirty}
          form="material-form"
          key="material-form-submit-button"
          type="submit"
        >
          <FormattedMessage {...formTranslations.submit} />
        </Button>
      )}
    </div>
  );

  return (
    <>
      <form
        encType="multipart/form-data"
        id="material-form"
        noValidate
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
      >
        <ErrorText errors={errors} />
        <div id="material-name">
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={<FormattedMessage {...translations.name} />}
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
        </div>

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
        <Controller
          name="file"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormSingleFileInput
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              previewComponent={FilePreview}
            />
          )}
        />
        <i style={{ fontSize: 13 }}>
          {intl.formatMessage(translations.fileHelpMessage)}
        </i>

        {actionButtons}
      </form>
    </>
  );
};

export default injectIntl(MaterialForm);
