export interface ScholaisticSettingsData {
  assessmentsTitle: string;
  pingResult:
    | { status: 'ok'; title: string; url: string }
    | { status: 'error' };
}

export interface ScholaisticSettingsPostData {
  settings_scholaistic_component: {
    assessments_title: ScholaisticSettingsData['assessmentsTitle'];
  };
}
