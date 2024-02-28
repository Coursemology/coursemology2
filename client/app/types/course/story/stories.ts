import { PersonalTimeData } from '../assessment/assessments';

export interface StoryData {
  title: string;
  description: string;
  published: boolean;
  startAt: string;
  endAt: string | null;
  providerId: string;
  baseExp?: number;
  timeBonusExp?: number | null;
  bonusEndAt?: string | null;
  hasPersonalTimes?: boolean;
  affectsPersonalTimes?: boolean;
}

export interface StoryShowData {
  story: StoryData;
  gamified: boolean;
  showPersonalizedTimelineFeatures: boolean;
  hasRooms: boolean;
}

export interface StoriesIndexData {
  stories: {
    id: number;
    title: string;
    description: string;
    published: boolean;
    startAt: PersonalTimeData;
    baseExp?: number;
    timeBonusExp?: number | null;
  }[];
  gamified: boolean;
  canManageStories: boolean;
}

export interface StoryNewData {
  gamified: boolean;
  showPersonalizedTimelineFeatures: boolean;
}
