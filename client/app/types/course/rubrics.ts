export interface RubricData {
  id: number;
  createdAt: string;
  categories: RubricCategoryData[];
  gradingPrompt: string;
}

export interface RubricDataWithEvaluations extends RubricData {
  answerEvaluations: Record<
    number,
    RubricAnswerEvaluationData | Record<string, never>
  >;
  mockAnswerEvaluations: Record<
    number,
    RubricMockAnswerEvaluationData | Record<string, never>
  >;
}

export interface RubricPostRequestData {
  grading_prompt: string;
  categories_attributes: {
    name: string;
    criterions_attributes: {
      grade: number;
      explanation: string;
    }[];
  }[];
}

export interface RubricCategoryData {
  id: number;
  name: string;
  maximumGrade: number;
  criterions: RubricCategoryCriterionData[];
  isBonusCategory: boolean;
}

export interface RubricCategoryCriterionData {
  id: number;
  grade: number;
  explanation: string;
}

export interface RubricAnswerEvaluationData {
  answerId: number;
  selections?: {
    mockAnswerId: number;
    categoryId: number;
    criterionId: number;
    grade: number;
  }[];
  feedback?: string;
  jobUrl?: string;
}

export interface RubricMockAnswerEvaluationData {
  mockAnswerId: number;
  selections?: {
    mockAnswerId: number;
    categoryId: number;
    criterionId: number;
    grade: number;
  }[];
  feedback?: string;
  jobUrl?: string;
}

export interface RubricAnswerData {
  id: number;
  title: string;
  grade?: number;
  answerText: string;
}
