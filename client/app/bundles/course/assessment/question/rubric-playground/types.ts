import {
  RubricCategoryCriterionData,
  RubricCategoryData,
} from 'types/course/rubrics';

export enum RubricPlaygroundTab {
  EDIT,
  EVALUATE,
  COMPARE,
}

export interface RubricCategoryEntity
  extends Omit<RubricCategoryData, 'maximumGrade'> {
  criterions: RubricCategoryCriterionEntity[];
  toBeDeleted?: boolean;
  draft?: boolean;
}

export interface RubricCategoryCriterionEntity
  extends RubricCategoryCriterionData {
  toBeDeleted?: boolean;
  draft?: boolean;
}

export interface RubricEditFormData {
  categories: RubricCategoryEntity[];
  gradingPrompt: string;
  modelAnswer: string;
}
