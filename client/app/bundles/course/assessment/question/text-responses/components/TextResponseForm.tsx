import { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Alert, RadioGroup } from '@mui/material';
import {
  AttachmentType,
  TextResponseData,
  TextResponseFormData,
} from 'types/course/assessment/question/text-responses';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import CommonQuestionFields from '../../components/CommonQuestionFields';
import { questionSchema, validateSolutions } from '../commons/validations';

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
    <Form
      dirty={isSolutionsDirty}
      disabled={submitting}
      emitsVia={setForm}
      headsUp
      initialValues={data.question!}
      onSubmit={handleSubmit}
      validates={questionSchema}
    >
      {(control, watch): JSX.Element => {
        const attachmentType = watch('attachmentType');
        return (
          <>
            <CommonQuestionFields
              availableSkills={data.availableSkills}
              control={control}
              disabled={submitting}
              skillsUrl={data.skillsUrl}
            />
            {data.isAssessmentAutograded &&
              data.questionType === 'file_upload' && (
                <Alert severity="info">{t(translations.fileUploadNote)}</Alert>
              )}

            <Section sticksToNavbar title={t(translations.fileUpload)}>
              <Subsection title={t(translations.attachmentOptions)}>
                <Controller
                  control={control}
                  name="attachmentType"
                  render={({ field }): JSX.Element => (
                    <RadioGroup className="space-y-5" {...field}>
                      {data.questionType === 'text_response' && (
                        <RadioButton
                          disabled={submitting}
                          label={t(translations.noAttachment)}
                          value="no_attachment"
                        />
                      )}
                      <RadioButton
                        disabled={submitting}
                        label={t(translations.singleFileAttachment)}
                        value="single_file_attachment"
                      />
                      <RadioButton
                        disabled={submitting}
                        label={t(translations.multipleFileAttachment)}
                        value="multiple_file_attachment"
                      />
                    </RadioGroup>
                  )}
                />

                {attachmentType !== AttachmentType.NO_ATTACHMENT && (
                  <div className="mt-5">
                    <Controller
                      control={control}
                      name="requireAttachment"
                      render={({ field, fieldState }): JSX.Element => (
                        <FormCheckboxField
                          disabled={submitting}
                          field={field}
                          fieldState={fieldState}
                          label={t(translations.requireAttachment)}
                        />
                      )}
                    />
                  </div>
                )}
              </Subsection>
            </Section>

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
  );
};

export default TextResponseForm;
