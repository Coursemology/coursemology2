import {
  SubscriptionComponent,
  SubscriptionType,
} from 'types/course/subscriptions';

interface UserEmailSettings {
  component: SubscriptionComponent;
  component_title: string;
  course_assessment_category_id: number;
  enabled: boolean;
  setting: SubscriptionType;
}

export interface UserEmailSubscriptionsState {
  settings: Partial<UserEmailSettings>[];
  pageFilter: {
    category_id: number | null;
    component: string | null;
    setting: string | null;
    show_all_settings: boolean;
    unsubscribe_successful?: boolean;
  };
}
