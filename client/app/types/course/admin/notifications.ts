import { SubscriptionComponent, SubscriptionType } from '../subscriptions';

export interface EmailSettings {
  id: number;
  course_id: number;
  component: SubscriptionComponent;
  course_assessment_category_id?: number;
  setting: SubscriptionType;
  phantom: boolean;
  regular: boolean;
  title?: string;
}

export type NotificationSettings = EmailSettings[];
