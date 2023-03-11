import { useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  ForumPostResponseData,
  ForumPostResponseFormData,
} from 'types/course/assessment/question/forum-post-responses';

import Section from 'lib/components/core/layouts/Section';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';
import CommonFieldsInQuestionForm from '../components/QuestionFormCommonFields';

import questionSchema from './validations';

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
  const [form, setForm] = useState<FormEmitter>();

  const handleSubmit = async (
    question: ForumPostResponseData['question'],
  ): Promise<void> => {
    const newData: ForumPostResponseData = { question };

    setSubmitting(true);

    props.onSubmit(newData).catch((errors) => {
      setSubmitting(false);
      form?.receiveErrors?.(errors);
    });
  };

  return (
    <Form
      disabled={submitting}
      emitsVia={setForm}
      headsUp
      initialValues={data.question}
      onSubmit={handleSubmit}
      validates={questionSchema}
    >
      {(control): JSX.Element => (
        <>
          <CommonFieldsInQuestionForm
            availableSkills={data.availableSkills}
            control={control}
            disabled={submitting}
            skillsUrl={data.skillsUrl}
          />

          <Section sticksToNavbar title={t(translations.forumPosts)}>
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
                  variant="filled"
                />
              )}
            />

            <Controller
              control={control}
              name="hasTextResponse"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  description={t(translations.enableTextResponse)}
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
