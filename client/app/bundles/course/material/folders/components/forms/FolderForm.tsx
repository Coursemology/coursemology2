import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Controller, UseFormSetError } from 'react-hook-form';
import { useSelector } from 'react-redux';
import * as yup from 'yup';
import formTranslations from 'lib/translations/form';
import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import useTranslation from 'lib/hooks/useTranslation';

import { FolderFormData } from 'types/course/material/folders';
import { AppState } from 'types/store';

import { getAdvanceStartAt } from '../../selectors';

interface Props {
  open: boolean;
  editing: boolean;
  onClose: () => void;
  onSubmit: (
    data: FolderFormData,
    setError: UseFormSetError<FolderFormData>,
  ) => void;
  title: string;
  initialValues: FolderFormData;
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
  const { open, editing, onClose, initialValues, onSubmit, title } = props;
  const { t } = useTranslation();
  const advanceStartAt = useSelector((state: AppState) =>
    getAdvanceStartAt(state),
  );

  return (
    <FormDialog
      open={open}
      editing={editing}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      formName="folder-form"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(control, formState): JSX.Element => (
        <>
          <div id="folder-name">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  field={field}
                  fieldState={fieldState}
                  disabled={formState.isSubmitting}
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
          </div>

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
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
            name="canStudentUpload"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormToggleField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(translations.canStudentUpload)}
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
                  disabled={formState.isSubmitting}
                  label={t(translations.startAt)}
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
                  disabled={formState.isSubmitting}
                  label={t(translations.endAt)}
                  style={{ flex: 1 }}
                />
              )}
            />
          </div>

          {editing && advanceStartAt !== 0 && (
            <div style={{ marginTop: 12 }}>{`${t(
              translations.earlyAccessMessage,
              {
                numDays: Math.ceil(advanceStartAt / (24 * 60 * 60)),
              },
            )}`}</div>
          )}
        </>
      )}
    </FormDialog>
  );
};

export default FolderForm;
