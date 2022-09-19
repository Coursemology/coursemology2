export interface VideosSettingsData {
  title: string;
  tabs: VideosTab[];
  canCreateTabs: boolean;
}

export interface VideosTab {
  id: number;
  title: string;
  weight: number;
  canDeleteTab: boolean;
}

export interface VideosSettingsPostData {
  settings_videos_component: {
    title: VideosSettingsData['title'];
    course: {
      video_tabs_attributes: {
        id: VideosTab['id'];
        title: VideosTab['title'];
        weight: VideosTab['weight'];
      }[];
    };
  };
}

export interface VideosTabPostData {
  tab: {
    title: VideosTab['title'];
    weight: VideosTab['weight'];
  };
}
