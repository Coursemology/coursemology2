import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Controller, UseFormSetError } from 'react-hook-form';
import * as yup from 'yup';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormSingleFileInput, {
  FilePreview,
} from 'lib/components/form/fields/SingleFileInput';

import { MaterialFormData } from 'types/course/material/folders';
import FormDialog from 'lib/components/form/dialog/FormDialog';
import useTranslation from 'lib/hooks/useTranslation';

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
      open={open}
      editing={editing}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      formName="material-form"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(control, formState): JSX.Element => (
        <>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(translations.name)}
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
            name="file"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormSingleFileInput
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
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
