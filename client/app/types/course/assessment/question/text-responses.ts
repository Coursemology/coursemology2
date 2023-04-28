import { AvailableSkills, OptionalIfNew, QuestionFormData } from '../questions';

export interface SolutionData {
  id: number | string;
  solution: string;
  solutionType: 'exact_match' | 'keyword';
  grade: number | string;
  explanation: string;
}

export interface SolutionEntity extends SolutionData {
  toBeDeleted?: boolean;
  draft?: boolean;
}

export interface TextResponseData<T extends 'new' | 'edit' = 'edit'> {
  solutions?: SolutionEntity[] | null | OptionalIfNew<T>;
  questionType: 'file_upload' | 'text_response';
  isAssessmentAutograded: boolean;
  question:
    | (QuestionFormData & {
        allowAttachment: boolean;
        hideText: boolean;
      })
    | OptionalIfNew<T>;
}

export type TextResponseFormData<T extends 'new' | 'edit' = 'edit'> =
  TextResponseData<T> & AvailableSkills;

type TextResponseFormDataQuestion = TextResponseFormData['question'];

export interface TextResponsePostData {
  question_text_response: {
    title?: TextResponseFormDataQuestion['title'];
    description?: TextResponseFormDataQuestion['description'];
    staff_only_comments?: TextResponseFormDataQuestion['staffOnlyComments'];
    maximum_grade: TextResponseFormDataQuestion['maximumGrade'];
    allow_attachment: TextResponseFormDataQuestion['allowAttachment'];
    hide_text: TextResponseFormDataQuestion['hideText'];
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
