import {
  AvailableSkills,
  OptionalIfNew,
  QuestionData,
  QuestionFormData,
} from '../questions';

export interface SolutionData {
  id: number | string;
  solution: string;
  solutionType: string;
  grade: number;
  explanation: string;
}

interface SolutionEntity extends SolutionData {
  toBeDeleted?: boolean;
  draft?: boolean;
}

export type TextResponseListData = QuestionData & { solutions: SolutionData[] };

export interface TextResponseData<T extends 'new' | 'edit' = 'edit'> {
  solutions: SolutionEntity[] | null | OptionalIfNew<T>;
  question:
    | (QuestionFormData & {
        allowAttachment: boolean;
        hideText: boolean;
      })
    | OptionalIfNew<T>;
}

export interface TextResponseFormData<T extends 'new' | 'edit' = 'edit'>
  extends TextResponseData<T>,
    AvailableSkills {}

type TextResponseFormDataQuestion = TextResponseFormData['question'];

export interface TextResponsePostData {
  question_text_response: {
    title?: TextResponseFormDataQuestion['title'];
    description?: TextResponseFormDataQuestion['description'];
    staff_only_comments?: TextResponseFormDataQuestion['staffOnlyComments'];
    maximum_grade?: TextResponseFormDataQuestion['maximumGrade'];
    allow_attachment?: TextResponseFormDataQuestion['allowAttachment'];
    hide_text?: TextResponseFormDataQuestion['hideText'];
    question_assessment?: {
      skill_ids: TextResponseFormDataQuestion['skillIds'];
    };
    solutions_attributes?: {
      id?: SolutionEntity['id'];
      solution?: SolutionEntity['solution'];
      solutionType?: SolutionEntity['solutionType'];
      grade?: SolutionEntity['grade'];
      explanation?: SolutionEntity['explanation'];
      _destroy?: SolutionEntity['toBeDeleted'];
    };
  };
}
