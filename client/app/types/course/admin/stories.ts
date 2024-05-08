export interface StoriesSettingsData {
  title: string;
  pushKey: string;
  pingResult: {
    status: 'ok' | 'error';
    remoteCourseName?: string;
    remoteCourseUrl?: string;
  };
}

export interface StoriesSettingsPostData {
  settings_stories_component: {
    title: string;
    push_key: StoriesSettingsData['pushKey'];
  };
}
