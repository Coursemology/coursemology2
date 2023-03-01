export interface CodaveriSettingsData {
  isOnlyITSP: boolean;
  isSolutionRequired: boolean;
}

export interface CodaveriSettingsPostData {
  settings_codaveri_component: {
    is_only_itsp: CodaveriSettingsData['isOnlyITSP'];
    is_solution_required: CodaveriSettingsData['isSolutionRequired'];
  };
}
