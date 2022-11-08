import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Controller, UseFormSetError } from 'react-hook-form';
import * as yup from 'yup';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import { NewCourseFormData } from 'types/course/courses';
import FormDialog from 'lib/components/form/dialog/FormDialog';
import useTranslation from 'lib/hooks/useTranslation';

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
      open={open}
      editing={false}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      formName="new-course-form"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(control, formState): JSX.Element => (
        <>
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(translations.title)}
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
        </>
      )}
    </FormDialog>
  );
};

export default NewCourseForm;
