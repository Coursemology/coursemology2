import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { MaterialFormData } from 'types/course/material/folders';
import * as yup from 'yup';

import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSingleFileInput, {
  FilePreview,
} from 'lib/components/form/fields/SingleFileInput';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

interface Props {
  open: boolean;
  editing: boolean;
  onClose: () => void;
  onSubmit: (
    data: MaterialFormData,
    setError: UseFormSetError<MaterialFormData>,
  ) => void;
  title: string;
  initialValues: MaterialFormData;
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
  const { open, editing, onClose, onSubmit, title, initialValues } = props;
  const { t } = useTranslation();

  return (
    <FormDialog
      editing={editing}
      formName="material-form"
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
            name="file"
            render={({ field, fieldState }): JSX.Element => (
              <FormSingleFileInput
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                previewComponent={FilePreview}
              />
            )}
          />

          <i style={{ fontSize: 13 }}>{t(translations.fileHelpMessage)}</i>
        </>
      )}
    </FormDialog>
  );
};

export default MaterialForm;
