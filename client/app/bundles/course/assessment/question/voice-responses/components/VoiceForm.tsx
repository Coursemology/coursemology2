import { useState } from 'react';
import {
  VoiceResponseData,
  VoiceResponseFormData,
} from 'types/course/assessment/question/voice-responses';

import Form, { FormEmitter } from 'lib/components/form/Form';

import CommonFieldsInQuestionForm from '../../components/QuestionFormCommonFields';
import questionSchema from '../commons/validation';

export interface VoiceFormProps<T extends 'new' | 'edit'> {
  with: VoiceResponseFormData<T>;
  onSubmit: (data: VoiceResponseData) => Promise<void>;
}

const VoiceForm = <T extends 'new' | 'edit'>(
  props: VoiceFormProps<T>,
): JSX.Element => {
  const { with: data } = props;

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormEmitter>();

  const handleSubmit = async (
    question: VoiceResponseData['question'],
  ): Promise<void> => {
    const newData: VoiceResponseData = {
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
      initialValues={data.question!}
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
