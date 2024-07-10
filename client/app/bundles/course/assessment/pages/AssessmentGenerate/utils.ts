import {
  BasicMetadata,
  LanguageMode,
  ProgrammingFormRequestData,
} from 'types/course/assessment/question/programming';
import { CodaveriGenerateResponseData } from 'types/course/assessment/question-generation';

import { CodaveriGenerateFormData, QuestionPrototypeFormData } from './types';

const getValidPythonTemplate = (prefix: string, template?: string): string => {
  if (!template) return '';
  if (template.trim().startsWith('def ')) {
    return template;
  }
  return [prefix, template].join('\n');
};

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
          public:
            response?.resources?.[0]?.exprTestcases
              ?.filter((testCase) => testCase?.visibility === 'public')
              ?.map((testCase) => ({
                expression: testCase.expression,
                expected: 'True',
                hint: testCase.hint,
              })) ?? [],
          private:
            response?.resources?.[0]?.exprTestcases
              ?.filter((testCase) => testCase?.visibility === 'private')
              ?.map((testCase) => ({
                expression: testCase.expression,
                expected: 'True',
                hint: testCase.hint,
              })) ?? [],
          evaluation:
            response?.resources?.[0]?.exprTestcases
              ?.filter((testCase) => testCase?.visibility === 'hidden')
              ?.map((testCase) => ({
                expression: testCase.expression,
                expected: 'True',
                hint: testCase.hint,
              })) ?? [],
        },
      },
    },
  };
}

export const buildGenerateRequestPayload = (
  codaveriData: CodaveriGenerateFormData,
  questionData: QuestionPrototypeFormData,
): FormData => {
  const data = new FormData();
  // TODO: Currently we are injecting the existing question data into the custom prompt directly.
  // When Codaveri implements this as a feature, make sure to use the updated request model.
  const fragments = [codaveriData.customPrompt];
  if (questionData?.question?.title) {
    fragments.push(`title is currently "${questionData?.question?.title}"`);
  }

  if (questionData?.question?.description) {
    fragments.push(
      `description is currently"${questionData?.question?.description}"`,
    );
  }

  if (questionData?.testUi?.metadata?.solution) {
    fragments.push(
      `solution is currently"${questionData?.testUi?.metadata?.solution}"`,
    );
  }

  if (questionData?.testUi?.metadata?.submission) {
    fragments.push(
      `template is currently"${questionData?.testUi?.metadata?.submission}"`,
    );
  }

  if (
    questionData?.testUi?.metadata?.testCases?.public &&
    questionData?.testUi?.metadata?.testCases?.public.length > 0
  ) {
    const subfragments = [`The current public test cases are:`];
    questionData?.testUi?.metadata?.testCases?.public.forEach(
      (testCase, index) => {
        fragments.push(
          `${index + 1}. ${testCase.expression} is ${testCase.expected} (${testCase.hint})`,
        );
      },
    );
    fragments.push(subfragments.join('\n'));
  }

  if (
    questionData?.testUi?.metadata?.testCases?.private &&
    questionData?.testUi?.metadata?.testCases?.private.length > 0
  ) {
    const subfragments = [`The current private test cases are:`];
    questionData?.testUi?.metadata?.testCases?.private.forEach(
      (testCase, index) => {
        subfragments.push(
          `${index + 1}. ${testCase.expression} is ${testCase.expected} (${testCase.hint})`,
        );
      },
    );
    fragments.push(subfragments.join('\n'));
  }

  if (
    questionData?.testUi?.metadata?.testCases?.evaluation &&
    questionData?.testUi?.metadata?.testCases?.evaluation.length > 0
  ) {
    const subfragments = [`The current evaluation test cases are:`];
    questionData?.testUi?.metadata?.testCases?.evaluation.forEach(
      (testCase, index) => {
        subfragments.push(
          `${index + 1}. ${testCase.expression} is ${testCase.expected} (${testCase.hint})`,
        );
      },
    );
    fragments.push(subfragments.join('\n'));
  }
  data.append('custom_prompt', fragments.join('\n'));

  data.append('language_id', codaveriData.languageId.toString());
  data.append('difficulty', codaveriData.difficulty);
  return data;
};

export const buildQuestionDataFromPrototype = (
  prefilledData: QuestionPrototypeFormData,
  languageId: number,
  languageMode: LanguageMode,
  assessmentAutograded: boolean,
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
      liveFeedbackEnabled: false,
      // set question to autograded if it includes at least one test case
      autograded:
        assessmentAutograded &&
        (prefilledData?.testUi?.metadata?.testCases?.public?.length > 0 ||
          prefilledData?.testUi?.metadata?.testCases?.private?.length > 0 ||
          prefilledData?.testUi?.metadata?.testCases?.evaluation?.length > 0),
    },
    testUi: {
      mode: languageMode,
      metadata,
    },
  };
};
