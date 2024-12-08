import {
  BasicMetadata,
  LanguageData,
  LanguageMode,
  MetadataTestCase,
  ProgrammingFormRequestData,
} from 'types/course/assessment/question/programming';
import { CodaveriGenerateResponseData } from 'types/course/assessment/question-generation';

import { defaultQuestionFormData } from './constants';
import { CodaveriGenerateFormData, QuestionPrototypeFormData } from './types';

const getValidPythonTemplate = (prefix: string, template?: string): string => {
  if (!template) return '';
  if (template.trim().startsWith('def ')) {
    return template;
  }
  return [prefix, template].join('\n');
};

function buildTestCases(
  visibility: 'public' | 'private' | 'hidden',
  response: CodaveriGenerateResponseData,
): MetadataTestCase[] {
  return (
    response?.resources?.[0]?.exprTestcases
      ?.filter((testCase) => testCase?.visibility === visibility)
      ?.map((testCase) => ({
        expression: testCase.lhsExpression,
        expected: testCase.rhsExpression,
        hint: testCase.hint,
      })) ?? []
  );
}

export function extractQuestionPrototypeData(
  response: CodaveriGenerateResponseData,
): QuestionPrototypeFormData {
  const prefix = response.resources[0]?.templates[0]?.prefix ?? '';

  return {
    question: {
      title: response.title,
      description: response.description,
    },
    testUi: {
      metadata: {
        submission: getValidPythonTemplate(
          prefix,
          response.resources[0]?.templates[0]?.content,
        ),
        solution: getValidPythonTemplate(
          prefix,
          response.resources[0]?.solutions[0]?.files[0]?.content,
        ),
        testCases: {
          public: buildTestCases('public', response),
          private: buildTestCases('private', response),
          evaluation: buildTestCases('hidden', response),
        },
      },
    },
  };
}

type IndexedTestCase = Record<
  number,
  { expression: string; expected: string; hint: string }
>;

export const buildGenerateRequestPayload = (
  codaveriData: CodaveriGenerateFormData,
  questionData: QuestionPrototypeFormData,
): FormData => {
  const data = new FormData();
  const isDefaultQuestionFormData =
    JSON.stringify(questionData) === JSON.stringify(defaultQuestionFormData);

  const stringifyTestCases = (testCases: MetadataTestCase[]): string => {
    const testCaseDict = {} as IndexedTestCase;
    testCases.forEach((testCase, index) => {
      testCaseDict[index + 1] = {
        expression: testCase.expression,
        expected: testCase.expected,
        hint: testCase.hint,
      };
    });

    return JSON.stringify(testCaseDict);
  };

  data.append(
    'is_default_question_form_data',
    isDefaultQuestionFormData.toString(),
  );

  if (questionData?.question?.title) {
    data.append('title', questionData.question.title);
  }

  if (questionData?.question?.description) {
    data.append('description', questionData.question.description);
  }

  if (questionData?.testUi?.metadata?.solution) {
    data.append('solution', questionData.testUi.metadata.solution);
  }

  if (questionData?.testUi?.metadata?.submission) {
    data.append('template', questionData.testUi.metadata.submission);
  }

  const publicTestCases = questionData?.testUi?.metadata?.testCases?.public;
  if (publicTestCases?.length > 0) {
    data.append('public_test_cases', stringifyTestCases(publicTestCases));
  }

  const privateTestCases = questionData?.testUi?.metadata?.testCases?.private;
  if (privateTestCases?.length > 0) {
    data.append('private_test_cases', stringifyTestCases(privateTestCases));
  }

  const evaluationTestCases =
    questionData?.testUi?.metadata?.testCases?.evaluation;
  if (evaluationTestCases?.length > 0) {
    data.append(
      'evaluation_test_cases',
      stringifyTestCases(evaluationTestCases),
    );
  }

  data.append('custom_prompt', codaveriData.customPrompt);

  data.append('language_id', codaveriData.languageId.toString());
  data.append('difficulty', codaveriData.difficulty);
  return data;
};

export const buildQuestionDataFromPrototype = (
  prefilledData: QuestionPrototypeFormData,
  languageId: LanguageData['id'],
  languageMode: LanguageMode,
): ProgrammingFormRequestData => {
  const metadata: BasicMetadata = {
    solution: prefilledData?.testUi?.metadata?.solution,
    submission: prefilledData?.testUi?.metadata?.submission,
    prepend: '',
    append: '',
    dataFiles: [],
    testCases: {
      public: prefilledData?.testUi?.metadata?.testCases?.public,
      private: prefilledData?.testUi?.metadata?.testCases?.private,
      evaluation: prefilledData?.testUi?.metadata?.testCases?.evaluation,
    },
  };
  return {
    question: {
      title: prefilledData.question.title,
      description: prefilledData.question.description,
      languageId,
      maximumGrade: '10.0',
      editOnline: true,
      isLowPriority: false,
      isCodaveri: false,
      liveFeedbackEnabled: false,
      // set question to autograded if it includes at least one test case
      autograded:
        prefilledData?.testUi?.metadata?.testCases?.public?.length > 0 ||
        prefilledData?.testUi?.metadata?.testCases?.private?.length > 0 ||
        prefilledData?.testUi?.metadata?.testCases?.evaluation?.length > 0,
    },
    testUi: {
      mode: languageMode,
      metadata,
    },
  };
};
