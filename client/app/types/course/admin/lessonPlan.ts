export interface LessonPlanItemSettings {
  component: string;
  enabled: boolean;
  visible: boolean;
  category_title?: string;
  tab_title?: string;
  options?: {
    category_id: number;
    tab_id: number;
  };
}

export interface LessonPlanSettings {
  items_settings: LessonPlanItemSettings[];
  component_settings: {
    milestones_expanded?: 'all' | 'none' | 'current';
  };
}
