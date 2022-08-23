import { FC, useEffect } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button } from '@mui/material';

import ErrorText from 'lib/components/ErrorText';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';

import { FolderFormData } from 'types/course/material/folders';
import { AppState } from 'types/store';

import { getAdvanceStartAt } from '../../selectors';

interface Props extends WrappedComponentProps {
  editing: boolean;
  handleClose: (isDirty: boolean) => void;
  onSubmit: (data: FolderFormData, setError: unknown) => void;
  setIsDirty: (value: boolean) => void;
  initialValues: Object;
  isSubmitting: boolean;
}

interface IFormInputs {
  name: string;
  description: string;
  canStudentUpload: boolean;
  startAt: string;
  endAt: string;
}

const translations = defineMessages({
  name: {
    id: 'course.materials.folders.folderForm.name',
    defaultMessage: 'Name',
  },
  description: {
    id: 'course.materials.folders.folderForm.description',
    defaultMessage: 'Description',
  },
  canStudentUpload: {
    id: 'course.materials.folders.folderForm.canStudentUpload',
    defaultMessage: 'Students are allowed to upload',
  },
  startAt: {
    id: 'course.materials.folders.folderForm.startAt',
    defaultMessage: 'Start At',
  },
  endAt: {
    id: 'course.materials.folders.folderForm.endAt',
    defaultMessage: 'End At',
  },
  earlyAccessMessage: {
    id: 'course.materials.folders.folderForm.earlyAccessMessage',
    defaultMessage:
      'Students can access materials {numDays} day(s) before the start date',
  },
});

const validationSchema = yup.object({
  name: yup.string().required(formTranslations.required),
  description: yup.string().nullable(),
  canStudentUpload: yup.bool(),
  startAt: yup.date().nullable(),
  endAt: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
    .min(yup.ref('startAt'), formTranslations.startEndDateValidationError),
});

const FolderForm: FC<Props> = (props) => {
  const {
    intl,
    editing,
    handleClose,
    initialValues,
    onSubmit,
    setIsDirty,
    isSubmitting,
  } = props;

  const advanceStartAt = useSelector((state: AppState) =>
    getAdvanceStartAt(state),
  );

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
        key="folder-form-cancel-button"
        onClick={(): void => handleClose(isDirty)}
      >
        <FormattedMessage {...formTranslations.cancel} />
      </Button>
      {editing ? (
        <Button
          id="folder-form-update-button"
          variant="contained"
          color="primary"
          className="btn-submit"
          disabled={disabled || !isDirty}
          form="folder-form"
          key="folder-form-update-button"
          type="submit"
        >
          <FormattedMessage {...formTranslations.update} />
        </Button>
      ) : (
        <Button
          id="folder-form-submit-button"
          color="primary"
          className="btn-submit"
          disabled={disabled || !isDirty}
          form="folder-form"
          key="folder-form-submit-button"
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
        id="folder-form"
        noValidate
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
      >
        <ErrorText errors={errors} />
        <div id="folder-name">
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
          name="canStudentUpload"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormToggleField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.canStudentUpload} />}
            />
          )}
        />
        <div style={{ marginBottom: 12 }} />

        <div style={{ display: 'flex' }}>
          <Controller
            name="startAt"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormDateTimePickerField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={<FormattedMessage {...translations.startAt} />}
                style={{ flex: 1 }}
              />
            )}
          />
          <Controller
            name="endAt"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormDateTimePickerField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={<FormattedMessage {...translations.endAt} />}
                style={{ flex: 1 }}
              />
            )}
          />
        </div>

        {editing && advanceStartAt !== 0 && (
          <div style={{ marginTop: 12 }}>{`${intl.formatMessage(
            translations.earlyAccessMessage,
            {
              numDays: Math.ceil(advanceStartAt / (24 * 60 * 60)),
            },
          )}`}</div>
        )}

        {actionButtons}
      </form>
    </>
  );
};

export default injectIntl(FolderForm);
