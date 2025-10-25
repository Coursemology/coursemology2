import {
  RubricCategoryCriterionData,
  RubricCategoryData,
} from 'types/course/rubrics';

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

export interface RubricHeaderFormData {
  categories: RubricCategoryEntity[];
  gradingPrompt: string;
}
