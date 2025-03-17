import { CodaveriGenerateFormData, QuestionPrototypeFormData } from './types';

export const defaultQuestionFormData: QuestionPrototypeFormData = {
  question: {
    title: '',
    description: '',
  },
  testUi: {
    metadata: {
      solution: '',
      submission: '',
      testCases: {
        public: [],
        private: [],
        evaluation: [],
      },
    },
  },
};

export const defaultCodaveriFormData: CodaveriGenerateFormData = {
  languageId: 0,
  customPrompt: '',
  difficulty: 'easy',
};
