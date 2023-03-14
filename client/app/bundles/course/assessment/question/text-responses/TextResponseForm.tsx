import { useState } from 'react';
import {
  TextResponseData,
  TextResponseFormData,
} from 'types/course/assessment/question/text-responses';

import Form, { FormEmitter } from 'lib/components/form/Form';

import CommonFieldsInQuestionForm from '../components/QuestionFormCommonFields';

import { questionSchema } from './validations';

export interface TextResponseFormProps<T extends 'new' | 'edit'> {
  with: TextResponseFormData<T>;
  onSubmit: (data: TextResponseData) => Promise<void>;
}

const TextResponseForm = <T extends 'new' | 'edit'>(
  props: TextResponseFormProps<T>,
): JSX.Element => {
  const { with: data } = props;

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormEmitter>();

  const handleSubmit = async (
    question: TextResponseData['question'],
  ): Promise<void> => {
    const newData: TextResponseData = {
      questionType: data.questionType,
      question,
    };
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
        <CommonFieldsInQuestionForm
          availableSkills={data.availableSkills}
          control={control}
          disabled={submitting}
          skillsUrl={data.skillsUrl}
        />
      )}
    </Form>
  );
};

export default TextResponseForm;
