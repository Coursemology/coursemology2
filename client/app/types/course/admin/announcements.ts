export interface AnnouncementsSettingsData {
  title: string;
}

export interface AnnouncementsSettingsPostData {
  settings_announcements_component: {
    title: AnnouncementsSettingsData['title'];
  };
}
