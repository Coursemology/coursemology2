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

export enum AttachmentType {
  NO_ATTACHMENT = 'no_attachment',
  SINGLE_FILE_ATTACHMENT = 'single_file_attachment',
  MULTIPLE_FILE_ATTACHMENT = 'multiple_file_attachment',
}

export interface TextResponseQuestionFormData extends QuestionFormData {
  attachmentType: AttachmentType;
  isAttachmentRequired: boolean;
  hideText: boolean;
}

export interface TextResponseData<T extends 'new' | 'edit' = 'edit'> {
  solutions?: SolutionEntity[] | null | OptionalIfNew<T>;
  questionType: 'file_upload' | 'text_response';
  isAssessmentAutograded: boolean;
  question: TextResponseQuestionFormData | OptionalIfNew<T>;
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
    attachment_type: TextResponseFormDataQuestion['attachmentType'];
    is_attachment_required: TextResponseFormDataQuestion['isAttachmentRequired'];
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
