import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { ForumFormData } from 'types/course/forums';
import * as yup from 'yup';

import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

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
      editing={editing}
      formName="forum-form"
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
            name="forumTopicsAutoSubscribe"
            render={({ field, fieldState }): JSX.Element => (
              <FormToggleField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
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
