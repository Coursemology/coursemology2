import { useState } from 'react';
import {
  VoiceData,
  VoiceFormData,
} from 'types/course/assessment/question/voice-responses';

import Form, { FormEmitter } from 'lib/components/form/Form';

import CommonFieldsInQuestionForm from '../components/CommonFieldsInQuestionForm';

import questionSchema from './validation';

export interface VoiceFormProps<T extends 'new' | 'edit'> {
  with: VoiceFormData<T>;
  onSubmit: (data: VoiceData) => Promise<void>;
}

const VoiceForm = <T extends 'new' | 'edit'>(
  props: VoiceFormProps<T>,
): JSX.Element => {
  const { with: data } = props;

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormEmitter>();

  const handleSubmit = async (
    question: VoiceData['question'],
  ): Promise<void> => {
    const newData: VoiceData = {
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

export default VoiceForm;
