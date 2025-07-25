import { AchievementBadgeData } from './assessment/assessments';

export interface ScholaisticAssessmentData {
  id: string;
  title: string;
  startAt: string;
  published: boolean;
  status: 'attempting' | 'submitted' | 'open' | 'unavailable';
  isStartTimeBegin: boolean;
  conditionSatisfied: boolean;
  endAt?: string;
  bonusEndAt?: string;
  isBonusEnded?: boolean;
  isEndTimePassed?: boolean;
  baseExp?: number;
  timeBonusExp?: number;
  topConditionals?: AchievementBadgeData[];
  remainingConditionalsCount?: number;
}

export interface ScholaisticAssessmentsIndexData {
  assessments: ScholaisticAssessmentData[];
  assessmentsTitle?: string;
  display: {
    isGamified: boolean;
    isAchievementsEnabled: boolean;
    canEditAssessments: boolean;
    canCreateAssessments: boolean;
    canViewSubmissions: boolean;
    isStudent: boolean;
  };
}
