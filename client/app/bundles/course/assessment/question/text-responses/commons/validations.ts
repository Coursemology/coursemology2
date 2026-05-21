import { AttachmentType } from 'types/course/assessment/question/text-responses';
import { AnyObjectSchema, array, bool, number, object, string } from 'yup';

import { MessageTranslator } from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import { commonQuestionFieldsValidation } from '../../components/CommonQuestionFields';

const solutionSchema = object({
  solutionType: string().required(translations.mustSpecifySolutionType),
  solution: string().when('toBeDeleted', {
    is: true,
    then: string().notRequired(),
    otherwise: string().required(translations.mustSpecifySolution),
  }),
  grade: number().when('toBeDeleted', {
    is: true,
    then: number().notRequired(),
    otherwise: number()
      .typeError(translations.mustSpecifyGrade)
      .required(translations.mustSpecifyGrade),
  }),
  explanation: string().nullable(),
  toBeDeleted: bool(),
});

export const questionSchema = (
  t: MessageTranslator,
  defaultMaxAttachmentSize: number,
  defaultMaxAttachments: number,
): AnyObjectSchema =>
  object({
    question: commonQuestionFieldsValidation.shape({
      attachmentType: string()
        .oneOf(
          Object.values(AttachmentType),
          translations.validAttachmentSettingValues,
        )
        .required(translations.attachmentSettingRequired),
      maxAttachments: number().when('attachmentType', {
        is: AttachmentType.MULTIPLE_ATTACHMENT,
        then: number()
          .required()
          .min(2, translations.mustSpecifyPositiveMaxAttachment)
          .max(
            defaultMaxAttachments,
            t(translations.mustBeLessThanMaxAttachments, {
              defaultMax: defaultMaxAttachments,
            }),
          )
          .typeError(translations.mustSpecifyMaxAttachment),
      }),
      maxAttachmentSize: number().when('attachmentType', {
        is: AttachmentType.NO_ATTACHMENT,
        then: number(),
        otherwise: number()
          .required()
          .min(1, translations.mustSpecifyPositiveMaxAttachmentSize)
          .max(
            defaultMaxAttachmentSize,
            t(translations.mustBeLessThanMaxAttachmentSize, {
              defaultMax: defaultMaxAttachmentSize,
            }),
          )
          .typeError(translations.mustSpecifyMaxAttachmentSize),
      }),
      isAttachmentRequired: bool(),
    }),
    solutions: array().of(solutionSchema),
  });
