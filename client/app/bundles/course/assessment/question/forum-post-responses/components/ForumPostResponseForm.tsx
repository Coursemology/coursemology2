import { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  ForumPostResponseData,
  ForumPostResponseFormData,
} from 'types/course/assessment/question/forum-post-responses';

import Section from 'lib/components/core/layouts/Section';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormRef } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import CommonQuestionFields from '../../components/CommonQuestionFields';
import questionSchema from '../commons/validations';

export interface ForumPostResponseFormProps<T extends 'new' | 'edit'> {
  with: ForumPostResponseFormData<T>;
  onSubmit: (data: ForumPostResponseData) => Promise<void>;
}

const ForumPostResponseForm = <T extends 'new' | 'edit'>(
  props: ForumPostResponseFormProps<T>,
): JSX.Element => {
  const { with: data } = props;

  const { t } = useTranslation();

  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<FormRef>(null);

  const handleSubmit = async (
    question: ForumPostResponseData['question'],
  ): Promise<void> => {
    const newData: ForumPostResponseData = { question };

    setSubmitting(true);

    props.onSubmit(newData).catch((errors) => {
      setSubmitting(false);
      formRef.current?.receiveErrors?.(errors);
    });
  };

  return (
    <Form
      ref={formRef}
      disabled={submitting}
      headsUp
      initialValues={data.question!}
      onSubmit={handleSubmit}
      validates={questionSchema}
    >
      {(control): JSX.Element => (
        <>
          <CommonQuestionFields
            availableSkills={data.availableSkills}
            control={control}
            disabled={submitting}
            skillsUrl={data.skillsUrl}
          />

          <Section
            sticksToNavbar
            subtitle={t(translations.forumPostsRequirements)}
            title={t(translations.forumPosts)}
          >
            <Controller
              control={control}
              name="maxPosts"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={submitting}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  label={t(translations.maxPosts)}
                  required
                  variant="filled"
                />
              )}
            />

            <Controller
              control={control}
              name="hasTextResponse"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  disabled={submitting}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.enableTextResponse)}
                />
              )}
            />
          </Section>
        </>
      )}
    </Form>
  );
};

export default ForumPostResponseForm;
