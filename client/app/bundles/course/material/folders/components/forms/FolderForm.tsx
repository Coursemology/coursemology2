import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { FolderFormData } from 'types/course/material/folders';
import * as yup from 'yup';

import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { getAdvanceStartAt } from '../../selectors';

interface Props {
  open: boolean;
  editing: boolean;
  onClose: () => void;
  onSubmit: (
    data: FolderFormData,
    setError: UseFormSetError<FolderFormData>,
  ) => Promise<void>;
  title: string;
  initialValues: FolderFormData;
}

const translations = defineMessages({
  name: {
    id: 'course.material.folders.FolderForm.name',
    defaultMessage: 'Name',
  },
  description: {
    id: 'course.material.folders.FolderForm.description',
    defaultMessage: 'Description',
  },
  canStudentUpload: {
    id: 'course.material.folders.FolderForm.canStudentUpload',
    defaultMessage: 'Students are allowed to upload',
  },
  startAt: {
    id: 'course.material.folders.FolderForm.startAt',
    defaultMessage: 'Start At',
  },
  endAt: {
    id: 'course.material.folders.FolderForm.endAt',
    defaultMessage: 'End At',
  },
  earlyAccessMessage: {
    id: 'course.material.folders.FolderForm.earlyAccessMessage',
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
  const { open, editing, onClose, initialValues, onSubmit, title } = props;
  const { t } = useTranslation();
  const advanceStartAt = useAppSelector(getAdvanceStartAt);

  return (
    <FormDialog
      editing={editing}
      formName="folder-form"
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
      title={title}
      validationSchema={validationSchema}
    >
      {(control, formState): JSX.Element => (
        <>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                autoFocus
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(translations.name)}
                required
                variant="standard"
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(translations.description)}
                variant="standard"
              />
            )}
          />
          <Controller
            control={control}
            name="canStudentUpload"
            render={({ field, fieldState }): JSX.Element => (
              <FormToggleField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                label={t(translations.canStudentUpload)}
              />
            )}
          />
          <div style={{ marginBottom: 12 }} />

          <div style={{ display: 'flex' }}>
            <Controller
              control={control}
              name="startAt"
              render={({ field, fieldState }): JSX.Element => (
                <FormDateTimePickerField
                  disabled={formState.isSubmitting}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.startAt)}
                  style={{ flex: 1 }}
                />
              )}
            />
            <Controller
              control={control}
              name="endAt"
              render={({ field, fieldState }): JSX.Element => (
                <FormDateTimePickerField
                  disabled={formState.isSubmitting}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.endAt)}
                  style={{ flex: 1 }}
                />
              )}
            />
          </div>

          {editing && advanceStartAt !== 0 && (
            <div style={{ marginTop: 12 }}>
              {t(translations.earlyAccessMessage, {
                numDays: Math.ceil(advanceStartAt / (24 * 60 * 60)),
              })}
            </div>
          )}
        </>
      )}
    </FormDialog>
  );
};

export default FolderForm;
