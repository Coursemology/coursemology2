export type TimelineAlgorithm = 'fixed' | 'fomo' | 'stragglers' | 'otot';

export interface PersonalTimeData {
  id: number; // id of lesson_plan_item
  personalTimeId?: number; // id of personal_time
  actableId: number;
  title: string;
  itemStartAt?: string;
  itemBonusEndAt?: string;
  itemEndAt?: string;
  personalStartAt?: Date;
  personalBonusEndAt?: Date;
  personalEndAt?: Date;
  type: string;
  fixed: boolean;
  new: boolean;
}
export interface PersonalTimeEntity {
  id: number;
  personalTimeId?: number;
  actableId: number;
  title: string;
  itemStartAt?: string;
  itemBonusEndAt?: string;
  itemEndAt?: string;
  personalStartAt?: Date;
  personalBonusEndAt?: Date;
  personalEndAt?: Date;
  type: string;
  fixed: boolean;
  new: boolean;
}

/**
 * Data types for POST personal time via /users/:id/personal_times
 */
export interface PersonalTimePostData {
  personal_time: {
    lesson_plan_item_id: number;
    fixed: boolean;
    start_at?: string | Date;
    bonus_end_at?: string | Date;
    end_at?: string | Date;
  };
}
