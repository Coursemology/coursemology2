export interface PersonalTimeData {
  isFixed: boolean;
  effectiveTime: string | null;
  referenceTime: string | null;
}

interface AssessmentActionsData {
  status: 'locked' | 'attempting' | 'submitted' | 'open' | 'unavailable';
  actionButtonUrl: string | null;
  submissionsUrl?: string;
  editUrl?: string;
  deleteUrl?: string;
}

export interface AssessmentListData extends AssessmentActionsData {
  id: number;
  title: string;
  passwordProtected: boolean;
  published: boolean;
  autograded: boolean;
  hasPersonalTimes: boolean;
  affectsPersonalTimes: boolean;
  url: string;
  conditionSatisfied: boolean;
  startAt: PersonalTimeData;
  isStartTimeBegin: boolean;

  baseExp?: number;
  timeBonusExp?: number;
  bonusEndAt?: PersonalTimeData;
  endAt?: PersonalTimeData;
  isBonusEnded?: boolean;
  isEndTimePassed?: boolean;
  remainingConditionalsCount?: number;
  topConditionals?: {
    url: string;
    badgeUrl: string;
    title: string;
  }[];
}

export interface AssessmentsListData {
  display: {
    isStudent: boolean;
    isGamified: boolean;
    allowRandomization: boolean;
    isAchievementsEnabled: boolean;
    bonusAttributes: boolean;
    endTimes: boolean;
    canCreateAssessments: boolean;
    tabId: number;
    category: {
      id: number;
      title: string;
      tabs: {
        id: number;
        title: string;
      }[];
    };
  };

  assessments: AssessmentListData[];
}
