export type TimelineAlgorithm = 'fixed' | 'fomo' | 'stragglers' | 'otot';

export interface PersonalTimeMiniEntity {
  id: number;
  personalTimeId?: number;
  actableId: number;
  title: string;
  itemStartAt: string | null;
  itemBonusEndAt: string | null;
  itemEndAt: string | null;
  personalStartAt?: Date;
  personalBonusEndAt?: Date;
  personalEndAt?: Date;
  type: string;
  fixed: boolean;
  new: boolean;
}

export interface PersonalTimeListData {
  id: number; // id of lesson_plan_item
  personalTimeId?: number; // id of personal_time
  actableId: number;
  title: string;
  itemStartAt: string | null;
  itemBonusEndAt: string | null;
  itemEndAt: string | null;
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

/**
 * Data type from PersonalTimeEditor form
 */
export interface PersonalTimeFormData {
  id: number;
  fixed: boolean;
  startAt?: string | Date;
  bonusEndAt?: string | Date;
  endAt?: string | Date;
}
