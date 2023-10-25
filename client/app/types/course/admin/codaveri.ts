export interface CodaveriSettingsData {
  isOnlyITSP: boolean;
  feedbackWorkflow: 'none' | 'draft' | 'publish';
}

export interface CodaveriSettingsEntity {
  isOnlyITSP: 'itsp' | 'default';
  feedbackWorkflow: CodaveriSettingsData['feedbackWorkflow'];
}

export interface CodaveriSettingsPatchData {
  settings_codaveri_component: {
    is_only_itsp: CodaveriSettingsData['isOnlyITSP'];
    feedback_workflow: CodaveriSettingsData['feedbackWorkflow'];
  };
}
