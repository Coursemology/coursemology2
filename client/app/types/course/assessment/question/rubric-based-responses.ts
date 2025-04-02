import { AvailableSkills, QuestionFormData } from '../questions';

export interface RubricBasedResponseData {
  question: QuestionFormData;
  categories?: CategoryEntity[] | null | undefined;
  isAssessmentAutograded: boolean;
}

export interface CategoryData {
  id: number | string | null;
  name: string;
  maximumGrade: number;
  grades: QuestionRubricGradeEntity[];
  isBonusCategory: boolean;
}

export interface CategoryEntity extends CategoryData {
  toBeDeleted?: boolean;
  draft?: boolean;
}

export interface AnswerRubricGradeData {
  id: number;
  gradeId: number | null;
  name: string;
  grade: number;
  explanation: string | null;
}

export interface QuestionRubricGradeData {
  id: number | string | null;
  grade: number;
  explanation: string;
}

export interface QuestionRubricGradeEntity extends QuestionRubricGradeData {
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
      maximum_grade?: CategoryEntity['maximumGrade'];
      _destroy?: CategoryEntity['toBeDeleted'];
      criterions_attributes?: {
        id?: QuestionRubricGradeEntity['id'];
        grade?: QuestionRubricGradeEntity['grade'];
        explanation?: QuestionRubricGradeEntity['explanation'];
        _destroy?: QuestionRubricGradeEntity['toBeDeleted'];
      }[];
    }[];
  };
}
