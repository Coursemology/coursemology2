export interface StoriesSettingsData {
  pushKey: string;
  pingResult: {
    status: 'ok' | 'error';
    remoteCourseName?: string;
    remoteCourseUrl?: string;
  };
}

export interface StoriesSettingsPostData {
  settings_stories_component: {
    push_key: StoriesSettingsData['pushKey'];
  };
}
