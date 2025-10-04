export interface RubricData {
  id: number;
  createdAt: string;
  categories: RubricCategoryData[];
  gradingPrompt: string;
}

export interface RubricCategoryData {
  id: number;
  name: string;
  criterions: RubricCategoryCriterionData[];
  isBonusCategory: boolean;
}

export interface RubricCategoryCriterionData {
  id: number;
  grade: number;
  explanation: string;
}
