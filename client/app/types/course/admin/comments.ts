export interface CommentsSettingsData {
  title: string;
  pagination: number;
}

export interface CommentsSettingsPostData {
  settings_topics_component: {
    title: CommentsSettingsData['title'];
    pagination: CommentsSettingsData['pagination'];
  };
}
