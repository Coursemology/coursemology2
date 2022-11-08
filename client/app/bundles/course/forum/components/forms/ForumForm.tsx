import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Controller, UseFormSetError } from 'react-hook-form';
import * as yup from 'yup';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import useTranslation from 'lib/hooks/useTranslation';
import { ForumFormData } from 'types/course/forums';
import FormDialog from 'lib/components/form/dialog/FormDialog';

interface Props {
  open: boolean;
  editing: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (
    data: ForumFormData,
    setError: UseFormSetError<ForumFormData>,
  ) => void;
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
  const { open, editing, title, onClose, initialValues, onSubmit } = props;
  const { t } = useTranslation();

  return (
    <FormDialog
      open={open}
      editing={editing}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      formName="forum-form"
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
            name="forumTopicsAutoSubscribe"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormToggleField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(translations.forumTopicsAutoSubscribe)}
              />
            )}
          />
        </>
      )}
    </FormDialog>
  );
};

export default ForumForm;
