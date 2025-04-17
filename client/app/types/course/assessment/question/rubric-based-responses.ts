import { AvailableSkills, QuestionFormData } from '../questions';

export interface RubricBasedResponseData {
  question: QuestionFormData;
  categories?: CategoryEntity[] | null | undefined;
  isAssessmentAutograded: boolean;
}

export interface CategoryData {
  id: number | string | null;
  name: string;
  maximumScore: number;
  levels: CategoryLevelEntity[];
  isBonusCategory: boolean;
}

export interface CategoryEntity extends CategoryData {
  toBeDeleted?: boolean;
  draft?: boolean;
}

export interface CategoryScoreData {
  id: number;
  name: string;
  score: number;
  explanation: string | null;
}

export interface CategoryLevelData {
  id: number | string | null;
  level: number;
  explanation: string;
}

export interface CategoryLevelEntity extends CategoryLevelData {
  toBeDeleted?: boolean;
  draft?: boolean;
}

export type RubricBasedResponseFormData = RubricBasedResponseData &
  AvailableSkills;

type RubricBasedResponseDataQuestion = RubricBasedResponseData['question'];

export interface RubricBasedResponsePostData {
  question_rubric_based_response: {
    title?: RubricBasedResponseDataQuestion['title'];
    description?: RubricBasedResponseDataQuestion['description'];
    staff_only_comments?: RubricBasedResponseDataQuestion['staffOnlyComments'];
    maximum_grade: RubricBasedResponseDataQuestion['maximumGrade'];
    question_assessment?: {
      skill_ids: RubricBasedResponseDataQuestion['skillIds'];
    };
    categories_attributes?: {
      id?: CategoryEntity['id'];
      name?: CategoryEntity['name'];
      maximum_score?: CategoryEntity['maximumScore'];
      _destroy?: CategoryEntity['toBeDeleted'];
      levels_attributes?: {
        id?: CategoryLevelEntity['id'];
        level?: CategoryLevelEntity['level'];
        explanation?: CategoryLevelEntity['explanation'];
        _destroy?: CategoryLevelEntity['toBeDeleted'];
      }[];
    }[];
  };
}
