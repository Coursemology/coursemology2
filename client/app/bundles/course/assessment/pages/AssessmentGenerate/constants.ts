import { LanguageMode } from 'types/course/assessment/question/programming';

import {
  MrqGenerateFormData,
  MrqPrototypeFormData,
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

export const defaultMrqPrototypeFormData: MrqPrototypeFormData = {
  question: {
    title: '',
    description: '',
    skipGrading: false,
    randomizeOptions: false,
  },
  options: [],
  gradingScheme: 'all_correct',
};

export const defaultMrqGenerateFormData: MrqGenerateFormData = {
  customPrompt: '',
  numberOfQuestions: 1,
};
