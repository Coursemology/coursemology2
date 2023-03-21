import { AvailableSkills, OptionalIfNew, QuestionFormData } from '../questions';

export interface VoiceResponseData<T extends 'new' | 'edit' = 'edit'> {
  question: QuestionFormData | OptionalIfNew<T>;
}

export interface VoiceResponseFormData<T extends 'new' | 'edit' = 'edit'>
  extends VoiceResponseData<T>,
    AvailableSkills {}

type VoiceResponseFormDataQuestion = VoiceResponseFormData['question'];

export interface VoiceResponsePostData {
  question_voice_response: {
    title?: VoiceResponseFormDataQuestion['title'];
    description?: VoiceResponseFormDataQuestion['description'];
    staff_only_comments?: VoiceResponseFormDataQuestion['staffOnlyComments'];
    maximum_grade: VoiceResponseFormDataQuestion['maximumGrade'];
    question_assessment?: {
      skill_ids: VoiceResponseFormDataQuestion['skillIds'];
    };
  };
}
