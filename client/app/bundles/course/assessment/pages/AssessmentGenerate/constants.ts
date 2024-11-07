import { MetadataTestCase } from 'types/course/assessment/question/programming';

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
        public: [] as MetadataTestCase[],
        private: [] as MetadataTestCase[],
        evaluation: [] as MetadataTestCase[],
      },
    },
  },
};

export const defaultCodaveriFormData: CodaveriGenerateFormData = {
  languageId: 0,
  customPrompt: '',
  difficulty: 'easy',
};
