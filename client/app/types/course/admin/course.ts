export interface CourseInfo {
  title: string;
  description: string;
  logo: string;
  published: boolean;
  enrollable: boolean;
  startAt: string;
  endAt: string;
  gamified: boolean;
  showPersonalizedTimelineFeatures: boolean;
  defaultTimelineAlgorithm: 'fixed' | 'fomo' | 'stragglers' | 'otot';
  timeZone: string;
  advanceStartAtDurationDays: number;
}

export interface CourseAdminItem {
  title: string;
  weight: number;
  path: string;
}

export interface CourseInfoPostData {
  course: {
    title?: CourseInfo['title'];
    description?: CourseInfo['description'];
    published?: CourseInfo['published'];
    enrollable?: CourseInfo['enrollable'];
    start_at?: CourseInfo['startAt'];
    end_at?: CourseInfo['endAt'];
    logo?: CourseInfo['logo'];
    gamified?: CourseInfo['gamified'];
    show_personalized_timeline_features?: CourseInfo['showPersonalizedTimelineFeatures'];
    default_timeline_algorithm?: CourseInfo['defaultTimelineAlgorithm'];
    time_zone?: CourseInfo['timeZone'];
    advance_start_at_duration_days?: CourseInfo['advanceStartAtDurationDays'];
  };
}

export type CourseAdminItems = CourseAdminItem[];

export interface TimeZone {
  name: string;
  displayName: string;
}

export type TimeZones = TimeZone[];
