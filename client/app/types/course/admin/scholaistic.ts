export interface ScholaisticSettingsData {
  assessmentsTitle: string;
}

export interface ScholaisticSettingsPostData {
  settings_scholaistic_component: {
    assessments_title: ScholaisticSettingsData['assessmentsTitle'];
  };
}
