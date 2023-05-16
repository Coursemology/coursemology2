import { QuestionFormData } from '../questions';

interface ScribingAttachmentReference {
  name: string;
  path: string;
  updater_name: string;
  image_url: string;
}

/**
 * Scribing Question form is defining its own skill interface.
 */
interface ScribingSkill {
  id: number;
  title: string;
}

export interface ScribingQuestion {
  id: number | null;
  title: QuestionFormData['title'];
  description: QuestionFormData['description'];
  staff_only_comments: QuestionFormData['staffOnlyComments'];
  maximum_grade: QuestionFormData['maximumGrade'];
  skill_ids: QuestionFormData['skillIds'];
  skills: ScribingSkill[];

  weight: number;
  attachment_reference: ScribingAttachmentReference | null;
  published_assessment: boolean;
}
