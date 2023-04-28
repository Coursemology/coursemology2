import { LanguageMode } from 'types/course/assessment/question/programming';
import {
  AnyObjectSchema,
  array,
  boolean,
  mixed,
  number,
  object,
  ref,
  string,
} from 'yup';

import { Translated } from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import translations from '../../../translations';
import { commonQuestionFieldsValidation } from '../../components/CommonQuestionFields';

const testCaseSchema: Translated<AnyObjectSchema> = (t) =>
  object({
    expression: string().required(t(formTranslations.required)),
    expected: string().required(t(formTranslations.required)),
    hint: string(),
  });

const testCasesSchemaOf: Translated<
  (body: AnyObjectSchema) => AnyObjectSchema
> =
  (t) =>
  (body: AnyObjectSchema): AnyObjectSchema =>
    object({
      public: array(body),
      private: array(body),
      evaluation: array(body),
    }).test({
      name: 'at-least-one-test-case',
      message: t(translations.atLeastOneTestCaseRequired),
      test: (testCases) =>
        Boolean(testCases.public?.length) ||
        Boolean(testCases.private?.length) ||
        Boolean(testCases.evaluation?.length),
    });

const basicMetadataSchema: Translated<AnyObjectSchema> = (t) =>
  object({
    prepend: string().nullable(),
    submission: string().nullable(),
    append: string().nullable(),
    solution: string().nullable(),
    dataFiles: array(),
    testCases: testCasesSchemaOf(t)(testCaseSchema(t)),
  });

const javaTestCaseSchema: Translated<AnyObjectSchema> = (t) =>
  testCaseSchema(t).shape({
    inlineCode: string().nullable(),
  });

const nullCaster = <C, O>(currentValue: C, originalValue: O): C | null =>
  originalValue ? currentValue : null;

const javaMetadataSchema: Translated<AnyObjectSchema> = (t) =>
  basicMetadataSchema(t).shape({
    submitAsFile: boolean(),
    submissionFiles: array(),
    solutionFiles: array(),
    testCases: testCasesSchemaOf(t)(javaTestCaseSchema(t)),
  });

const POLYGLOT_SCHEMA: Partial<
  Record<LanguageMode, Translated<AnyObjectSchema>>
> = {
  python: basicMetadataSchema,
  c_cpp: basicMetadataSchema,
  java: javaMetadataSchema,
};

const schema: Translated<AnyObjectSchema> = (t) =>
  object({
    question: commonQuestionFieldsValidation.shape({
      languageId: number().required(formTranslations.required),
      memoryLimit: number()
        .min(0, t(translations.hasToBeValidNumber))
        .transform(nullCaster)
        .nullable()
        .typeError(t(translations.hasToBeValidNumber)),
      timeLimit: number()
        .min(0, t(translations.hasToBeValidNumber))
        .max(ref('maxTimeLimit'), ({ max }) =>
          t(translations.cannotBeMoreThanMaxLimit, { max }),
        )
        .transform(nullCaster)
        .nullable()
        .typeError(t(translations.hasToBeValidNumber)),
      isLowPriority: boolean(),
      autograded: boolean(),
      attemptLimit: number()
        .min(1, t(translations.hasToBeAtLeastOne))
        .transform(nullCaster)
        .nullable()
        .typeError(t(translations.hasToBeAtLeastOne)),
      isCodaveri: boolean(),
      editOnline: boolean(),
    }),
    testUi: mixed().when('question.editOnline', {
      is: true,
      then: object({
        metadata: mixed().when(
          'mode',
          (mode: LanguageMode) => POLYGLOT_SCHEMA[mode]?.(t) ?? mixed(),
        ),
      }),
    }),
  });

export default schema;
