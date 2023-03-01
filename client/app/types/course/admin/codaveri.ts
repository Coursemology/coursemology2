export interface CodaveriSettingsData {
  isOnlyITSP: boolean;
}

export interface CodaveriSettingsPostData {
  settings_codaveri_component: {
    is_only_itsp: CodaveriSettingsData['isOnlyITSP'];
  };
}
