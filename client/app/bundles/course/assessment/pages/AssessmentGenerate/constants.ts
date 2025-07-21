import { LanguageMode } from 'types/course/assessment/question/programming';

import {
  McqMrqGenerateFormData,
  McqMrqPrototypeFormData,
  ProgrammingGenerateFormData,
  ProgrammingPrototypeFormData,
} from './types';

export const defaultProgrammingPrototypeFormData: ProgrammingPrototypeFormData =
  {
    question: {
      title: '',
      description: '',
    },
    testUi: {
      metadata: {
        solution: '',
        submission: '',
        prepend: null,
        append: null,
        testCases: {
          public: [],
          private: [],
          evaluation: [],
        },
      },
    },
  };

export const defaultProgrammingGenerateFormData: ProgrammingGenerateFormData = {
  languageId: 0,
  customPrompt: '',
  difficulty: 'easy',
};

export const CODAVERI_EVALUATOR_ONLY_LANGUAGES: LanguageMode[] = [
  'r',
  'javascript',
  'csharp',
  'golang',
  'rust',
  'typescript',
];

export const defaultMcqMrqGenerateFormData: McqMrqGenerateFormData = {
  customPrompt: '',
  numberOfQuestions: 1,
  generationMode: 'create',
};

export const defaultMcqPrototypeFormData: McqMrqPrototypeFormData = {
  question: {
    title: '',
    description: '',
    skipGrading: false,
    randomizeOptions: false,
  },
  options: [],
  gradingScheme: 'any_correct',
};

export const defaultMrqPrototypeFormData: McqMrqPrototypeFormData = {
  question: {
    title: '',
    description: '',
    skipGrading: false,
    randomizeOptions: false,
  },
  options: [],
  gradingScheme: 'all_correct',
};
