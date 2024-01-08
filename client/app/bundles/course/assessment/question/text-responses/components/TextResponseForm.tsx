import { useRef, useState } from 'react';
import { Alert, Container } from '@mui/material';
import {
  AttachmentType,
  TextResponseData,
  TextResponseFormData,
} from 'types/course/assessment/question/text-responses';

import Section from 'lib/components/core/layouts/Section';
import Form, { FormEmitter } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import CommonQuestionFields from '../../components/CommonQuestionFields';
import { questionSchema, validateSolutions } from '../commons/validations';
import { TextResponseFormDataProvider } from '../hooks/TextResponseFormDataContext';

import FileUploadManager from './FileUploadManager';
import SolutionsManager, { SolutionsManagerRef } from './SolutionsManager';

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
  const [isSolutionsDirty, setIsSolutionsDirty] = useState(false);

  const solutionsRef = useRef<SolutionsManagerRef>(null);

  const prepareSolutions = async (
    questionType: 'file_upload' | 'text_response',
  ): Promise<TextResponseData<T>['solutions'] | undefined> => {
    solutionsRef.current?.resetErrors();
    if (questionType === 'file_upload') return [];

    const solutions = solutionsRef.current?.getSolutions() ?? [];
    const errors = await validateSolutions(solutions);

    if (errors) {
      solutionsRef.current?.setErrors(errors);
      return undefined;
    }

    return solutions;
  };

  const { t } = useTranslation();

  const handleSubmit = async (
    question: TextResponseData['question'],
  ): Promise<void> => {
    const solutions = await prepareSolutions(data.questionType);
    if (!solutions) return;

    const newQuestion = {
      ...question,
      requireAttachment:
        question.attachmentType !== AttachmentType.NO_ATTACHMENT &&
        question.requireAttachment,
    };

    const newData: TextResponseData = {
      questionType: data.questionType,
      isAssessmentAutograded: data.isAssessmentAutograded,
      question: newQuestion,
      solutions,
    };
    setSubmitting(true);
    props.onSubmit(newData).catch((errors) => {
      setSubmitting(false);
      form?.receiveErrors?.(errors);
    });
  };

  return (
    <TextResponseFormDataProvider data={data.question!}>
      <Form
        contextual
        dirty={isSolutionsDirty}
        disabled={submitting}
        emitsVia={setForm}
        headsUp
        initialValues={data.question!}
        onSubmit={handleSubmit}
        validates={questionSchema}
      >
        {(control): JSX.Element => {
          return (
            <>
              <CommonQuestionFields
                availableSkills={data.availableSkills}
                control={control}
                disabled={submitting}
                skillsUrl={data.skillsUrl}
              />

              <FileUploadManager
                disabled={submitting}
                isTextResponseQuestion={data.questionType === 'text_response'}
              />

              {data.isAssessmentAutograded &&
                data.questionType === 'file_upload' && (
                  <Container className="mb-6" disableGutters>
                    <Alert severity="info">
                      {t(translations.fileUploadNote)}
                    </Alert>
                  </Container>
                )}

              {data.questionType === 'text_response' && (
                <Section
                  sticksToNavbar
                  subtitle={t(translations.solutionsHint)}
                  title={t(translations.solutions)}
                >
                  <SolutionsManager
                    ref={solutionsRef}
                    disabled={submitting}
                    for={data.solutions ?? []}
                    isAssessmentAutograded={data.isAssessmentAutograded}
                    onDirtyChange={setIsSolutionsDirty}
                  />
                </Section>
              )}
            </>
          );
        }}
      </Form>
    </TextResponseFormDataProvider>
  );
};

export default TextResponseForm;
