export interface CommentsSettingsData {
  title: string;
  pagination: number;
  isShowingAiGeneratedComments: boolean;
}

export interface CommentsSettingsPostData {
  settings_topics_component: {
    title: CommentsSettingsData['title'];
    pagination: CommentsSettingsData['pagination'];
    is_showing_ai_generated_comments: CommentsSettingsData['isShowingAiGeneratedComments'];
  };
}
