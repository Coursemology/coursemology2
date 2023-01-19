import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { ForumTopicFormData, TopicType } from 'types/course/forums';
import * as yup from 'yup';

import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

interface Props {
  open: boolean;
  editing: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (
    data: ForumTopicFormData,
    setError: UseFormSetError<ForumTopicFormData>,
  ) => Promise<void>;
  initialValues: ForumTopicFormData;
  availableTopicTypes?: TopicType[];
  isAnonymousEnabled?: boolean;
}

const translations = defineMessages({
  title: {
    id: 'course.forum.ForumTopicForm.title',
    defaultMessage: 'Title',
  },
  text: {
    id: 'course.forum.ForumTopicForm.text',
    defaultMessage: 'Text',
  },
  topicType: {
    id: 'course.forum.ForumTopicForm.topicType',
    defaultMessage: 'Topic Type',
  },
  postAnonymously: {
    id: 'course.forum.ForumTopicForm.postAnonymously',
    defaultMessage: 'Anonymous post',
  },
});

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  text: yup.string(),
  isAnonymous: yup.bool(),
});

const defaultTopicTypes = [
  { label: TopicType.NORMAL, value: TopicType.NORMAL },
  { label: TopicType.QUESTION, value: TopicType.QUESTION },
];

const ForumTopicForm: FC<Props> = (props) => {
  const {
    open,
    title,
    editing,
    onClose,
    initialValues,
    onSubmit,
    availableTopicTypes,
    isAnonymousEnabled,
  } = props;
  const { t } = useTranslation();

  const topicTypeOptions = availableTopicTypes
    ? availableTopicTypes.map((type) => ({
        label: type,
        value: type,
      }))
    : defaultTopicTypes;

  return (
    <FormDialog
      editing={editing}
      formName="forum-topic-form"
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
                label={t(translations.title)}
                required
                variant="filled"
              />
            )}
          />

          {!editing && (
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
                    label={t(translations.text)}
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

          <Controller
            control={control}
            name="topicType"
            render={({ field, fieldState }): JSX.Element => (
              <FormSelectField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                label={t(translations.topicType)}
                options={topicTypeOptions}
                variant="filled"
              />
            )}
          />
        </>
      )}
    </FormDialog>
  );
};

export default ForumTopicForm;
