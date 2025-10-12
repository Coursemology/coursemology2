export interface RubricData {
  id: number;
  createdAt: string;
  categories: RubricCategoryData[];
  gradingPrompt: string;
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

export interface RubricEvaluationData {
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
