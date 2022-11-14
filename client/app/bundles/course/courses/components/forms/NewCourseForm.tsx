import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { NewCourseFormData } from 'types/course/courses';
import * as yup from 'yup';

import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (
    data: NewCourseFormData,
    setError: UseFormSetError<NewCourseFormData>,
  ) => void;
  initialValues: NewCourseFormData;
}

const translations = defineMessages({
  title: {
    id: 'course.form.title',
    defaultMessage: 'Give it an awesome name',
  },
  description: {
    id: 'course.form.description',
    defaultMessage: 'Give it an awesome backstory!',
  },
});

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  description: yup.string().nullable(),
});

const NewCourseForm: FC<Props> = (props) => {
  const { open, title, onClose, initialValues, onSubmit } = props;
  const { t } = useTranslation();

  return (
    <FormDialog
      editing={false}
      formName="new-course-form"
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
            name="title"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(translations.title)}
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
        </>
      )}
    </FormDialog>
  );
};

export default NewCourseForm;
