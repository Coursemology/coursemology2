export interface MaterialsSettingsData {
  title: string;
}

export interface MaterialsSettingsPostData {
  settings_materials_component: {
    title: MaterialsSettingsData['title'];
  };
}
