import { useRef, useState } from 'react';
import {
  RubricBasedResponseData,
  RubricBasedResponseFormData,
} from 'types/course/assessment/question/rubric-based-responses';

import Section from 'lib/components/core/layouts/Section';
import Form, { FormRef } from 'lib/components/form/Form';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import schema from '../commons/validation';
import { RubricBasedResponseFormDataProvider } from '../hooks/RubricBasedResponseFormDataContext';

import CategoryManager from './CategoryManager';
import QuestionFields from './QuestionFields';

export interface RubricBasedResponseFormProps {
  with: RubricBasedResponseFormData;
  onSubmit: (data: RubricBasedResponseData) => Promise<void>;
}

const RubricBasedResponseForm = (
  props: RubricBasedResponseFormProps,
): JSX.Element => {
  const { with: data } = props;

  const { t } = useTranslation();

  const [submitting, setSubmitting] = useState(false);
  const [isCategoriesDirty, setIsCategoriesDirty] = useState(false);

  const formRef = useRef<FormRef<RubricBasedResponseFormData>>(null);

  const handleSubmit = async (
    rawData: RubricBasedResponseData,
  ): Promise<void> => {
    const newData: RubricBasedResponseData = {
      isAssessmentAutograded: rawData.isAssessmentAutograded,
      question: rawData.question,
      categories: rawData.categories,
    };

    setSubmitting(true);
    props.onSubmit(newData).catch((error) => {
      toast.error(error || t(translations.errorWhenSavingQuestion));
      return setSubmitting(false);
    });
  };

  return (
    <RubricBasedResponseFormDataProvider from={data}>
      <Form
        ref={formRef}
        contextual
        dirty={isCategoriesDirty}
        disabled={submitting}
        headsUp
        initialValues={data}
        onSubmit={handleSubmit}
        validates={schema(t)}
      >
        <QuestionFields disabled={submitting} disableSettingMaxGrade />
        <Section
          sticksToNavbar
          subtitle={t(translations.rubricHint)}
          title={t(translations.rubric)}
        >
          <CategoryManager
            disabled={submitting}
            for={data.categories ?? []}
            onDirtyChange={setIsCategoriesDirty}
          />
        </Section>
      </Form>
    </RubricBasedResponseFormDataProvider>
  );
};

export default RubricBasedResponseForm;
