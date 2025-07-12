import {
  McqMrqData,
  McqMrqFormData,
} from 'types/course/assessment/question/multiple-responses';
import {
  BasicMetadata,
  JavaMetadataTestCase,
  LanguageData,
  LanguageMode,
  MetadataTestCase,
  ProgrammingFormData,
  ProgrammingFormRequestData,
} from 'types/course/assessment/question/programming';
import {
  CodaveriGenerateResponseData,
  MrqGeneratedOption,
  MrqGenerateResponseData,
  TestcaseVisibility,
} from 'types/course/assessment/question-generation';

import {
  CODAVERI_EVALUATOR_ONLY_LANGUAGES,
  defaultMrqPrototypeFormData,
  defaultProgrammingPrototypeFormData,
} from './constants';
import {
  MrqGenerateFormData,
  MrqPrototypeFormData,
  ProgrammingGenerateFormData,
  ProgrammingPrototypeFormData,
} from './types';

function buildFromExpressionTestCase(
  visibility: TestcaseVisibility,
  response: CodaveriGenerateResponseData,
): MetadataTestCase[] {
  return (
    response?.resources?.[0]?.exprTestcases
      ?.filter((testCase) => testCase?.visibility === visibility)
      ?.map((testCase) => ({
        expression: testCase.lhsExpression,
        expected: testCase.rhsExpression,
        prefix: testCase.prefix ?? '',
        hint: testCase.hint,
      })) ?? []
  );
}

function buildFromIOTestCase(
  visibility: TestcaseVisibility,
  response: CodaveriGenerateResponseData,
): MetadataTestCase[] {
  return (
    response?.IOTestcases?.filter(
      (testCase) => testCase?.visibility === visibility,
    )?.map((testCase) => ({
      expression: testCase.input,
      expected: testCase.output,
      hint: testCase.hint,
    })) ?? []
  );
}

function buildTestCases(
  visibility: TestcaseVisibility,
  response: CodaveriGenerateResponseData,
): MetadataTestCase[] {
  return buildFromExpressionTestCase(visibility, response).concat(
    buildFromIOTestCase(visibility, response),
  );
}

export function extractQuestionPrototypeData(
  response: CodaveriGenerateResponseData,
): ProgrammingPrototypeFormData {
  return {
    question: {
      title: response.title,
      description: response.description,
    },
    testUi: {
      metadata: {
        prepend: response.resources[0]?.templates[0]?.prefix ?? null,
        submission: response.resources[0]?.templates[0]?.content ?? '',
        solution: response.resources[0]?.solutions[0]?.files[0]?.content ?? '',
        append: response.resources[0]?.templates[0]?.suffix ?? null,
        testCases: {
          public: buildTestCases('public', response),
          private: buildTestCases('private', response),
          evaluation: buildTestCases('hidden', response),
        },
      },
    },
  };
}

export function replaceUnlockedPrototypeFields(
  oldData: ProgrammingPrototypeFormData,
  newData: ProgrammingPrototypeFormData,
  lockStates: Record<string, boolean>,
): ProgrammingPrototypeFormData {
  return {
    question: {
      title: lockStates['question.title']
        ? oldData.question.title
        : newData.question.title,
      description: lockStates['question.description']
        ? oldData.question.description
        : newData.question.description,
    },
    testUi: {
      metadata: {
        submission: lockStates['testUi.metadata.submission']
          ? oldData.testUi?.metadata.submission
          : newData.testUi.metadata.submission,
        solution: lockStates['testUi.metadata.solution']
          ? oldData.testUi?.metadata.solution
          : newData.testUi.metadata.solution,
        prepend: lockStates['testUi.metadata.prepend']
          ? oldData.testUi?.metadata.prepend
          : newData.testUi.metadata.prepend,
        append: lockStates['testUi.metadata.append']
          ? oldData.testUi?.metadata.append
          : newData.testUi.metadata.append,
        testCases: {
          public: lockStates['testUi.metadata.testCases.public']
            ? oldData.testUi?.metadata.testCases.public
            : newData.testUi.metadata.testCases.public,
          private: lockStates['testUi.metadata.testCases.private']
            ? oldData.testUi?.metadata.testCases.private
            : newData.testUi.metadata.testCases.private,
          evaluation: lockStates['testUi.metadata.testCases.evaluation']
            ? oldData.testUi?.metadata.testCases.evaluation
            : newData.testUi.metadata.testCases.evaluation,
        },
      },
    },
  };
}

const stringifyTestCases = <T extends MetadataTestCase | JavaMetadataTestCase>(
  testCases: T[],
  isIncludingInlineCode: boolean,
): string => {
  const testCaseDict: Record<number, T> = {};
  testCases.forEach((testCase, index) => {
    testCaseDict[index + 1] = {
      expression: testCase.expression,
      expected: testCase.expected,
      hint: testCase.hint,
    } as T;
    if (isIncludingInlineCode) {
      (testCaseDict[index + 1] as JavaMetadataTestCase).inlineCode = (
        testCase as JavaMetadataTestCase
      ).inlineCode;
    }
  });
  return JSON.stringify(testCaseDict);
};

export const buildProgrammingGenerateRequestPayload = (
  generateFormData: ProgrammingGenerateFormData,
  questionData: ProgrammingPrototypeFormData,
  isIncludingInlineCode: boolean,
): FormData => {
  const data = new FormData();
  const isDefaultProgrammingPrototypeFormData =
    JSON.stringify(questionData) ===
    JSON.stringify(defaultProgrammingPrototypeFormData);

  data.append(
    'is_default_question_form_data',
    isDefaultProgrammingPrototypeFormData.toString(),
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
    data.append(
      'public_test_cases',
      stringifyTestCases(publicTestCases, isIncludingInlineCode),
    );
  }

  const privateTestCases = questionData?.testUi?.metadata?.testCases?.private;
  if (privateTestCases?.length > 0) {
    data.append(
      'private_test_cases',
      stringifyTestCases(privateTestCases, isIncludingInlineCode),
    );
  }

  const evaluationTestCases =
    questionData?.testUi?.metadata?.testCases?.evaluation;
  if (evaluationTestCases?.length > 0) {
    data.append(
      'evaluation_test_cases',
      stringifyTestCases(evaluationTestCases, isIncludingInlineCode),
    );
  }

  data.append('custom_prompt', generateFormData.customPrompt);

  data.append('language_id', generateFormData.languageId.toString());
  data.append('difficulty', generateFormData.difficulty);
  return data;
};

export const buildProgrammingQuestionDataFromPrototype = (
  prefilledData: ProgrammingPrototypeFormData,
  languageId: LanguageData['id'],
  languageMode: LanguageMode,
): ProgrammingFormRequestData => {
  const isCodaveri = CODAVERI_EVALUATOR_ONLY_LANGUAGES.includes(languageMode);
  const metadata: BasicMetadata = {
    solution: prefilledData?.testUi?.metadata?.solution,
    submission: prefilledData?.testUi?.metadata?.submission,
    prepend: prefilledData?.testUi?.metadata?.prepend,
    append: prefilledData?.testUi?.metadata?.append,
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
      isCodaveri,
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

export const buildPrototypeFromProgrammingQuestionData = (
  questionData: ProgrammingFormData,
): ProgrammingPrototypeFormData => {
  return {
    question: questionData.question,
    testUi: {
      metadata: {
        prepend: questionData.testUi?.metadata?.prepend || '',
        append: questionData.testUi?.metadata?.append || '',
        solution: questionData.testUi?.metadata?.solution || '',
        submission: questionData.testUi?.metadata?.submission || '',
        testCases: questionData.testUi?.metadata?.testCases || {
          public: questionData.testUi?.metadata?.testCases?.public || [],
          private: questionData.testUi?.metadata?.testCases?.private || [],
          evaluation:
            questionData.testUi?.metadata?.testCases?.evaluation || [],
        },
      },
    },
  };
};

export function extractMrqQuestionPrototypeData(
  response: MrqGenerateResponseData,
): MrqPrototypeFormData {
  // Parse the real API response
  const timestamp = Date.now();
  const options =
    response.options && response.options.length > 0
      ? response.options.map((option: MrqGeneratedOption, index: number) => ({
          id: `option-${timestamp}-${index}`,
          option: option.option,
          correct: option.correct,
          weight: index + 1,
          explanation: option.explanation || '',
          ignoreRandomization: false,
          toBeDeleted: false,
        }))
      : [];

  return {
    question: {
      title: response.title || 'Generated MRQ Question',
      description: response.description || 'Generated question description',
      skipGrading: false,
      randomizeOptions: false,
    },
    options,
    gradingScheme: 'all_correct',
  };
}

export function replaceUnlockedMrqPrototypeFields(
  oldData: MrqPrototypeFormData,
  newData: MrqPrototypeFormData,
  lockStates: Record<string, boolean>,
): MrqPrototypeFormData {
  return {
    question: {
      title: lockStates['question.title']
        ? oldData.question.title
        : newData.question.title,
      description: lockStates['question.description']
        ? oldData.question.description
        : newData.question.description,
      skipGrading: lockStates['question.skipGrading']
        ? oldData.question.skipGrading
        : newData.question.skipGrading,
      randomizeOptions: lockStates['question.randomizeOptions']
        ? oldData.question.randomizeOptions
        : newData.question.randomizeOptions,
    },
    options: lockStates['question.options'] ? oldData.options : newData.options,
    gradingScheme: lockStates.gradingScheme
      ? oldData.gradingScheme
      : newData.gradingScheme,
  };
}

export const buildMrqGenerateRequestPayload = (
  generateFormData: MrqGenerateFormData,
  prototypeFormData: MrqPrototypeFormData,
): FormData => {
  const data = new FormData();
  const isDefaultMrqPrototypeFormData =
    JSON.stringify(prototypeFormData) ===
    JSON.stringify(defaultMrqPrototypeFormData);

  data.append(
    'is_default_question_form_data',
    isDefaultMrqPrototypeFormData.toString(),
  );

  // Add source question data for context
  const sourceQuestionData = {
    title: prototypeFormData?.question?.title || '',
    description: prototypeFormData?.question?.description || '',
    options: prototypeFormData?.options || [],
  };

  data.append('source_question_data', JSON.stringify(sourceQuestionData));

  if (prototypeFormData?.question?.title) {
    data.append('title', prototypeFormData.question.title);
  }

  if (prototypeFormData?.question?.description) {
    data.append('description', prototypeFormData.question.description);
  }

  if (prototypeFormData?.options?.length > 0) {
    data.append('options', JSON.stringify(prototypeFormData.options));
  }

  data.append('custom_prompt', generateFormData.customPrompt);
  data.append(
    'number_of_questions',
    generateFormData.numberOfQuestions.toString(),
  );
  return data;
};

export const buildMrqQuestionDataFromPrototype = (
  prefilledData: MrqPrototypeFormData,
): McqMrqData => {
  // Filter out empty options before sending to backend
  const filteredOptions =
    prefilledData.options?.filter(
      (option) => option.option && option.option.trim().length > 0,
    ) || [];

  return {
    gradingScheme: prefilledData.gradingScheme,
    question: {
      title: prefilledData.question.title,
      description: prefilledData.question.description,
      skipGrading: prefilledData.question.skipGrading,
      randomizeOptions: prefilledData.question.randomizeOptions,
      maximumGrade: '10.0',
      staffOnlyComments: '',
      skillIds: [],
    },
    options: filteredOptions,
  };
};

export const buildPrototypeFromMrqQuestionData = (
  questionData: McqMrqFormData,
): MrqPrototypeFormData => {
  const timestamp = Date.now();
  const options = (questionData.options || []).map((option, index) => ({
    ...option,
    id: option.id?.toString().startsWith('option-')
      ? option.id
      : `option-${timestamp}-${index}`,
  }));

  return {
    question: {
      title: questionData.question?.title || '',
      description: questionData.question?.description || '',
      skipGrading: questionData.question?.skipGrading || false,
      randomizeOptions: questionData.question?.randomizeOptions || false,
    },
    options,
    gradingScheme: questionData.gradingScheme || 'all_correct',
  };
};
