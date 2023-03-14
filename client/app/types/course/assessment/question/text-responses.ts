import { AvailableSkills, OptionalIfNew, QuestionFormData } from '../questions';

export interface SolutionData {
  id: number | string;
  solution: string;
  solutionType: string;
  grade: number;
  explanation: string;
}

export interface SolutionEntity extends SolutionData {
  toBeDeleted?: boolean;
  draft?: boolean;
}

export interface TextResponseData<T extends 'new' | 'edit' = 'edit'> {
  solutions?: SolutionEntity[] | null | OptionalIfNew<T>;
  questionType: 'file_upload' | 'text_response';
  question:
    | (QuestionFormData & {
        allowAttachment?: boolean;
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
    }[];
  };
}
