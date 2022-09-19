export interface ForumsSettingsData {
  title: string;
  pagination: number;
}

export interface ForumsSettingsPostData {
  settings_forums_component: {
    title: ForumsSettingsData['title'];
    pagination: ForumsSettingsData['pagination'];
  };
}
