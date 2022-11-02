import { FC, useEffect } from 'react';
import { defineMessages } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mui/material';
import ErrorText from 'lib/components/core/ErrorText';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import useTranslation from 'lib/hooks/useTranslation';
import { ForumTopicFormData, TopicType } from 'types/course/forums';

interface Props {
  handleClose: (isDirty: boolean) => void;
  onSubmit: (data: ForumTopicFormData, setError: unknown) => void;
  setIsDirty?: (value: boolean) => void;
  initialValues: IFormInputs;
  availableTopicTypes?: TopicType[];
}

interface IFormInputs {
  id?: number;
  title: string;
  text?: string;
  topicType: TopicType;
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
    handleClose,
    initialValues,
    onSubmit,
    setIsDirty,
    availableTopicTypes,
  } = props;
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<IFormInputs>({
    defaultValues: initialValues,
    resolver: yupResolver<yup.AnyObjectSchema>(validationSchema),
  });

  useEffect(() => {
    if (setIsDirty) {
      if (isDirty) {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    }
  }, [isDirty]);

  const disabled = isSubmitting;

  const topicTypeOptions = availableTopicTypes
    ? availableTopicTypes.map((type) => ({
        label: type,
        value: type,
      }))
    : defaultTopicTypes;

  const actionButtons = (
    <div className="mt-2 flex justify-end space-x-2">
      <Button
        color="secondary"
        className="btn-cancel"
        disabled={disabled}
        key="forum-topic-form-cancel-button"
        onClick={(): void => handleClose(isDirty)}
      >
        {t(formTranslations.cancel)}
      </Button>
      {initialValues.id ? (
        <Button
          variant="contained"
          color="primary"
          className="btn-submit"
          disabled={disabled || !isDirty}
          form="forum-topic-form"
          key="forum-topic-form-update-button"
          type="submit"
        >
          {t(formTranslations.update)}
        </Button>
      ) : (
        <Button
          color="primary"
          className="btn-submit"
          disabled={disabled || !isDirty}
          form="forum-topic-form"
          key="forum-topic-form-submit-button"
          type="submit"
        >
          {t(formTranslations.submit)}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <form
        encType="multipart/form-data"
        id="forum-topic-form"
        noValidate
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
      >
        <ErrorText errors={errors} />
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
              disabled={disabled}
              required
            />
          )}
        />
        {!initialValues.id && (
          <Controller
            name="text"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                field={field}
                fieldState={fieldState}
                fullWidth
                disableMargins
                disabled={disabled}
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
              disabled={disabled}
            />
          )}
        />
        {actionButtons}
      </form>
    </>
  );
};

export default ForumTopicForm;
