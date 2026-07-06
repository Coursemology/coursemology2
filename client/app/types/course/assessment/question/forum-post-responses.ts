import { AvailableSkills, OptionalIfNew, QuestionFormData } from '../questions';

import { CategoryEntity } from './rubric-based-responses';

export interface ForumPostResponseData<T extends 'new' | 'edit' = 'edit'> {
  question:
    | (QuestionFormData & { hasTextResponse: boolean; maxPosts: string | null })
    | OptionalIfNew<T>;
  // Grading configuration. The frontend renders the grading-mode switch only when more than one mode is
  // supported; the rubric config below is shown/forwarded only under rubric grading mode.
  gradingMode: string;
  supportedGradingModes: string[];
  categories?: CategoryEntity[] | null | undefined;
  aiGradingEnabled: boolean;
  aiGradingCustomPrompt: string;
  aiGradingModelAnswer: string;
}

export type ForumPostResponseFormData<T extends 'new' | 'edit' = 'edit'> =
  ForumPostResponseData<T> & AvailableSkills & { parentQuestionId?: number };

type ForumPostResponseFormDataQuestion = ForumPostResponseData['question'];

export interface ForumPostResponsePostData {
  question_forum_post_response: {
    title?: ForumPostResponseFormDataQuestion['title'];
    description?: ForumPostResponseFormDataQuestion['description'];
    staff_only_comments?: ForumPostResponseFormDataQuestion['staffOnlyComments'];
    maximum_grade: ForumPostResponseFormDataQuestion['maximumGrade'];
    has_text_response?: ForumPostResponseFormDataQuestion['hasTextResponse'];
    max_posts?: ForumPostResponseFormDataQuestion['maxPosts'];
    grading_mode?: ForumPostResponseData['gradingMode'];
    question_assessment?: {
      skill_ids: ForumPostResponseFormDataQuestion['skillIds'];
    };
    categories_attributes?: {
      id?: CategoryEntity['id'];
      name?: CategoryEntity['name'];
      _destroy?: CategoryEntity['toBeDeleted'];
      criterions_attributes?: {
        id?: CategoryEntity['grades'][number]['id'];
        grade?: CategoryEntity['grades'][number]['grade'];
        explanation?: CategoryEntity['grades'][number]['explanation'];
        _destroy?: CategoryEntity['grades'][number]['toBeDeleted'];
      }[];
    }[];
    ai_grading_enabled?: ForumPostResponseData['aiGradingEnabled'];
    ai_grading_custom_prompt?: ForumPostResponseData['aiGradingCustomPrompt'];
    ai_grading_model_answer?: ForumPostResponseData['aiGradingModelAnswer'];
  };
}
