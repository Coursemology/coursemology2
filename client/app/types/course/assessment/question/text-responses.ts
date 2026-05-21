import { AvailableSkills, QuestionFormData } from '../questions';

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
  SINGLE_ATTACHMENT = 'single_attachment',
  MULTIPLE_ATTACHMENT = 'multiple_attachment',
}

export const INITIAL_MAX_ATTACHMENTS = 3;
export const INITIAL_MAX_ATTACHMENT_SIZE = 10;

export interface TextResponseQuestionFormData extends QuestionFormData {
  attachmentType: AttachmentType;
  maxAttachments: number;
  maxAttachmentSize: number | null;
  isAttachmentRequired: boolean;
  hideText: boolean;
  templateText: string | null;
}

export interface TextResponseFormData extends AvailableSkills {
  solutions?: SolutionEntity[];
  questionType: 'file_upload' | 'text_response';
  isAssessmentAutograded: boolean;
  defaultMaxAttachmentSize: number;
  defaultMaxAttachments: number;
  question: TextResponseQuestionFormData;
}
export type TextResponseEditableFormData = Pick<
  TextResponseFormData,
  'question' | 'solutions'
>;

type TextResponseFormDataQuestion = TextResponseFormData['question'];

export interface TextResponsePostData {
  question_text_response: {
    title?: TextResponseFormDataQuestion['title'];
    description?: TextResponseFormDataQuestion['description'];
    staff_only_comments?: TextResponseFormDataQuestion['staffOnlyComments'];
    maximum_grade: TextResponseFormDataQuestion['maximumGrade'];
    template_text: TextResponseFormDataQuestion['templateText'];
    max_attachments: TextResponseFormDataQuestion['maxAttachments'];
    max_attachment_size: TextResponseFormDataQuestion['maxAttachmentSize'];
    is_attachment_required: TextResponseFormDataQuestion['isAttachmentRequired'];
    hide_text: TextResponseFormDataQuestion['hideText'];
    question_assessment?: {
      skill_ids: TextResponseFormDataQuestion['skillIds'];
    };
    solutions_attributes?: {
      id?: SolutionEntity['id'];
      solution?: SolutionEntity['solution'];
      solution_type?: SolutionEntity['solutionType'];
      grade?: SolutionEntity['grade'];
      explanation?: SolutionEntity['explanation'];
      _destroy?: SolutionEntity['toBeDeleted'];
    }[];
  };
}
