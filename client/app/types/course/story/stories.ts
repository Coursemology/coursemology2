export interface StoryData {
  id: number;
  title: string;
  description: string;
  published: boolean;
  startAt: string;
  baseExp?: number;
  timeBonusExp?: number | null;
}

export interface StoriesIndexData {
  stories: StoryData[];
  gamified: boolean;
  canManageStories: boolean;
}
