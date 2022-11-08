import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Controller, UseFormSetError } from 'react-hook-form';
import * as yup from 'yup';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import useTranslation from 'lib/hooks/useTranslation';
import { ForumTopicFormData, TopicType } from 'types/course/forums';
import FormDialog from 'lib/components/form/dialog/FormDialog';

interface Props {
  open: boolean;
  editing: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (
    data: ForumTopicFormData,
    setError: UseFormSetError<ForumTopicFormData>,
  ) => void;
  initialValues: ForumTopicFormData;
  availableTopicTypes?: TopicType[];
}

const translations = defineMessages({
  title: {
    id: 'course.forum.topic.form.name',
    defaultMessage: 'Title',
  },
  text: {
    id: 'course.forum.topic.form.text',
    defaultMessage: 'Text',
  },
  topicType: {
    id: 'course.forum.topic.form.topicType',
    defaultMessage: 'Topic Type',
  },
});

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  text: yup.string(),
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
      open={open}
      editing={editing}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      formName="forum-topic-form"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(control, formState): JSX.Element => (
        <>
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                label={t(translations.title)}
                variant="filled"
                fullWidth
                disabled={formState.isSubmitting}
                required
              />
            )}
          />
          {!editing && (
            <Controller
              name="text"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormRichTextField
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  disableMargins
                  disabled={formState.isSubmitting}
                  label={t(translations.text)}
                  required
                />
              )}
            />
          )}
          <Controller
            name="topicType"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormSelectField
                field={field}
                fieldState={fieldState}
                label={t(translations.topicType)}
                variant="filled"
                options={topicTypeOptions}
                disabled={formState.isSubmitting}
              />
            )}
          />
        </>
      )}
    </FormDialog>
  );
};

export default ForumTopicForm;
