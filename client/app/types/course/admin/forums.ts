export interface ForumsSettingsData {
  title: string;
  pagination: number;
  markPostAsAnswerSetting: 'creator_only' | 'everyone';
}

export interface ForumsSettingsPostData {
  settings_forums_component: {
    title: ForumsSettingsData['title'];
    pagination: ForumsSettingsData['pagination'];
    mark_post_as_answer_setting: ForumsSettingsData['markPostAsAnswerSetting'];
  };
}
