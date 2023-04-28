import { AvailableSkills, OptionalIfNew, QuestionFormData } from '../questions';

export interface ForumPostResponseData<T extends 'new' | 'edit' = 'edit'> {
  question:
    | (QuestionFormData & { hasTextResponse: boolean; maxPosts: string | null })
    | OptionalIfNew<T>;
}

export type ForumPostResponseFormData<T extends 'new' | 'edit' = 'edit'> =
  ForumPostResponseData<T> & AvailableSkills;

type ForumPostResponseFormDataQuestion = ForumPostResponseData['question'];

export interface ForumPostResponsePostData {
  question_forum_post_response: {
    title?: ForumPostResponseFormDataQuestion['title'];
    description?: ForumPostResponseFormDataQuestion['description'];
    staff_only_comments?: ForumPostResponseFormDataQuestion['staffOnlyComments'];
    maximum_grade: ForumPostResponseFormDataQuestion['maximumGrade'];
    has_text_response?: ForumPostResponseFormDataQuestion['hasTextResponse'];
    max_posts?: ForumPostResponseFormDataQuestion['maxPosts'];
    question_assessment?: {
      skill_ids: ForumPostResponseFormDataQuestion['skillIds'];
    };
  };
}
