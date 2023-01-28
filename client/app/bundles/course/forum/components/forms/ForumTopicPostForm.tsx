import { FC } from 'react';
import { Controller } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { ForumTopicPostFormData } from 'types/course/forums';
import * as yup from 'yup';

import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  open: boolean;
  editing: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (data: ForumTopicPostFormData) => Promise<void>;
  initialValues: ForumTopicPostFormData;
  isAnonymousEnabled: boolean;
}

const translations = defineMessages({
  postAnonymously: {
    id: 'course.forum.ForumTopicPostForm.postAnonymously',
    defaultMessage: 'Anonymous post',
  },
});

const validationSchema = yup.object({
  text: yup.string(),
  isAnonymous: yup.bool(),
});

const ForumTopicPostForm: FC<Props> = (props) => {
  const {
    open,
    title,
    editing,
    onClose,
    initialValues,
    isAnonymousEnabled,
    onSubmit,
  } = props;
  const { t } = useTranslation();

  return (
    <FormDialog
      editing={editing}
      formName="forum-topic-post-form"
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
            name="text"
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={formState.isSubmitting}
                disableMargins
                field={field}
                fieldState={fieldState}
                fullWidth
                required
              />
            )}
          />

          {isAnonymousEnabled && !editing && (
            <Controller
              control={control}
              name="isAnonymous"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  disabled={formState.isSubmitting}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.postAnonymously)}
                />
              )}
            />
          )}
        </>
      )}
    </FormDialog>
  );
};

export default ForumTopicPostForm;
