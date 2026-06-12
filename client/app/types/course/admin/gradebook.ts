export interface GradebookSettingsData {
  weightedViewEnabled: boolean;
}

export interface GradebookSettingsPostData {
  settings_gradebook_component: {
    weighted_view_enabled: GradebookSettingsData['weightedViewEnabled'];
  };
}
