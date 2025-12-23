export interface TimeData {
  id: number;
  startAt: string;
  bonusEndAt?: string;
  endAt?: string;
}

export interface TimelineData {
  id: number;
  timesCount: number;
  title?: string;
  default?: boolean;
  weight?: number;
  assignees?: number;
}

export interface ItemWithTimeData {
  id: number;
  title: string;
  times: Record<TimelineData['id'], TimeData>;
}

export interface TimelinesData {
  timelines: TimelineData[];
  items: ItemWithTimeData[];
  gamified: boolean;
  defaultTimeline: TimelineData['id'];
}

export interface TimelinePostData {
  reference_timeline: {
    title?: TimelineData['title'];
    weight?: TimelineData['weight'];
  };
}

export interface TimePostData {
  reference_time: {
    lesson_plan_item_id?: number;
    start_at?: string;
    end_at?: string | null;
    bonus_end_at?: string | null;
  };
}
