export interface CourseComponent {
  id: string;
  displayName: string;
  enabled: boolean;
}

export type CourseComponents = CourseComponent[];

export interface CourseComponentsPostData {
  settings_components: {
    enabled_component_ids: CourseComponent['id'][];
  };
}
