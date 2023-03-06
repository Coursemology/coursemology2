import { AvailableSkills, QuestionFormData } from '../questions';

type OptionalIfNew<T extends 'new' | 'edit'> = T extends 'new'
  ? undefined
  : never;

export interface VoiceData<T extends 'new' | 'edit' = 'edit'> {
  question: QuestionFormData | OptionalIfNew<T>;
}

export interface VoiceFormData<T extends 'new' | 'edit' = 'edit'>
  extends VoiceData<T>,
    AvailableSkills {
  allowRandomization: boolean;
}

type VoiceFormDataQuestion = VoiceFormData['question'];

export interface VoicePostData {
  question_voice_response: {
    title?: VoiceFormDataQuestion['title'];
    description?: VoiceFormDataQuestion['description'];
    staff_only_comments?: VoiceFormDataQuestion['staffOnlyComments'];
    maximum_grade?: VoiceFormDataQuestion['maximumGrade'];
    question_assessment?: { skill_ids: VoiceFormDataQuestion['skillIds'] };
  };
}
