import { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Alert } from '@mui/material';
import {
  AttachmentType,
  INITIAL_MAX_ATTACHMENT_SIZE,
  INITIAL_MAX_ATTACHMENTS,
  TextResponseEditableFormData,
  TextResponseFormData,
} from 'types/course/assessment/question/text-responses';

import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import Form, { FormRef } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import CommonQuestionFields from '../../components/CommonQuestionFields';
import { questionSchema } from '../commons/validations';
import {
  getAttachmentTypeFromMaxAttachment,
  getMaxAttachmentFromAttachmentType,
  getMaxAttachmentSize,
} from '../utils';

import FileUploadManager from './FileUploadManager';
import SolutionsManager from './SolutionsManager';

export interface TextResponseFormProps {
  with: TextResponseFormData;
  onSubmit: (data: TextResponseEditableFormData) => Promise<void>;
}

const TextResponseForm = (props: TextResponseFormProps): JSX.Element => {
  const { with: data } = props;

  const formattedData: TextResponseEditableFormData = {
    question: {
      ...data.question,
      templateText: data.question?.templateText ?? null,
      attachmentType:
        data.question?.attachmentType ??
        getAttachmentTypeFromMaxAttachment(data.question?.maxAttachments),
      maxAttachments:
        data.question && data.question.maxAttachments <= 1
          ? INITIAL_MAX_ATTACHMENTS
          : data.question!.maxAttachments,
      maxAttachmentSize:
        data.question && !data.question.maxAttachmentSize
          ? INITIAL_MAX_ATTACHMENT_SIZE
          : data.question!.maxAttachmentSize,
    },
    solutions: data.solutions ?? [],
  };

  const [submitting, setSubmitting] = useState(false);

  const formRef = useRef<FormRef>(null);

  const { t } = useTranslation();

  const handleSubmit = async ({
    solutions,
    question,
  }: TextResponseEditableFormData): Promise<void> => {
    const newData: TextResponseEditableFormData = {
      solutions: data.questionType === 'file_upload' ? [] : solutions,
      question: {
        ...question,
        isAttachmentRequired:
          question.attachmentType === AttachmentType.NO_ATTACHMENT
            ? false
            : question.isAttachmentRequired,
        maxAttachments: getMaxAttachmentFromAttachmentType(question),
        maxAttachmentSize: getMaxAttachmentSize(question),
        templateText: question.templateText,
      },
    };
    setSubmitting(true);
    props.onSubmit(newData).catch((errors) => {
      setSubmitting(false);
      formRef.current?.receiveErrors?.(errors);
    });
  };

  return (
    <Form
      ref={formRef}
      contextual
      disabled={submitting}
      headsUp
      initialValues={formattedData}
      onSubmit={handleSubmit}
      validates={questionSchema(
        t,
        data.defaultMaxAttachmentSize,
        data.defaultMaxAttachments,
      )}
    >
      {(control): JSX.Element => (
        <>
          <CommonQuestionFields
            availableSkills={data.availableSkills}
            control={control}
            disabled={submitting}
            name="question"
            skillsUrl={data.skillsUrl}
          />
          {data.questionType === 'text_response' && (
            <Section
              sticksToNavbar
              subtitle={t(translations.templateTextDescription)}
              title={t(translations.templateText)}
            >
              <Controller
                control={control}
                name="templateText"
                render={({ field, fieldState }): JSX.Element => (
                  <FormRichTextField
                    disabled={submitting}
                    field={field}
                    fieldState={fieldState}
                    fullWidth
                    variant="filled"
                  />
                )}
              />
            </Section>
          )}
          {data.isAssessmentAutograded &&
            data.questionType === 'file_upload' && (
              <Alert severity="warning">{t(translations.fileUploadNote)}</Alert>
            )}

          <Section
            sticksToNavbar
            subtitle={t(translations.fileUploadDescription)}
            title={t(translations.fileUpload)}
          >
            <Subsection
              subtitle={t(translations.attachmentSettingsDescription)}
              title={t(translations.attachmentSettings)}
            >
              <FileUploadManager
                disabled={submitting}
                isTextResponseQuestion={data.questionType === 'text_response'}
              />
            </Subsection>
          </Section>

          {data.questionType === 'text_response' && (
            <Section
              sticksToNavbar
              subtitle={t(translations.solutionsHint)}
              title={t(translations.solutions)}
            >
              <SolutionsManager
                disabled={submitting}
                isAssessmentAutograded={data.isAssessmentAutograded}
              />
            </Section>
          )}
        </>
      )}
    </Form>
  );
};

export default TextResponseForm;
