import { QuestionType } from './question';
import type { QuestionData } from './questions';

export interface PersonalTimeData {
  isFixed: boolean;
  effectiveTime: string | null;
  referenceTime: string | null;
}

interface AssessmentActionsData {
  status: 'locked' | 'attempting' | 'submitted' | 'open' | 'unavailable';
  actionButtonUrl: string | null;
  monitoringUrl?: string;
  statisticsUrl?: string;
  submissionsUrl?: string;
  editUrl?: string;
  deleteUrl?: string;
}

export interface AchievementBadgeData {
  url: string;
  badgeUrl: string | null;
  title: string;
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
  hasTodo?: boolean;
  isBonusEnded?: boolean;
  isEndTimePassed?: boolean;
  remainingConditionalsCount?: number;
  topConditionals?: AchievementBadgeData[];
}

export interface AssessmentsListData {
  display: {
    isStudent: boolean;
    isGamified: boolean;
    allowRandomization: boolean;
    isAchievementsEnabled: boolean;
    isMonitoringEnabled: boolean;
    bonusAttributes: boolean;
    endTimes: boolean;
    canCreateAssessments: boolean;
    tabId: number;
    tabTitle: string;
    tabUrl: string;
    canManageMonitor: boolean;
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

interface NewQuestionBuilderData {
  type: keyof typeof QuestionType;
  url: string;
}

export interface AssessmentData extends AssessmentActionsData {
  id: number;
  title: string;
  tabTitle: string;
  tabUrl: string;
  description: string;
  autograded: boolean;
  startAt: PersonalTimeData;
  hasAttempts: boolean;
  permissions: {
    canAttempt: boolean;
    canManage: boolean;
    canObserve: boolean;
  };
  requirements: {
    title: string;
    satisfied?: boolean;
  }[];
  indexUrl: string;

  endAt?: PersonalTimeData;
  hasTodo?: boolean;
  unlocks?: {
    description: string;
    title: string;
    url: string;
  }[];
  baseExp?: number;
  timeBonusExp?: number;
  bonusEndAt?: PersonalTimeData;
  willStartAt?: string;
  materialsDisabled?: boolean;
  componentsSettingsUrl?: string;
  files?: {
    id: number;
    name: string;
    url?: string;
  }[];

  allowRecordDraftAnswer?: boolean;
  showMcqMrqSolution?: boolean;
  gradedTestCases?: string;
  skippable?: boolean;
  allowPartialSubmission?: boolean;
  showMcqAnswer?: boolean;
  hasUnautogradableQuestions?: boolean;
  questions?: QuestionData[];
  newQuestionUrls?: NewQuestionBuilderData[];
}

export interface UnauthenticatedAssessmentData {
  id: number;
  title: string;
  tabTitle: string;
  tabUrl: string;
  isAuthenticated: false;
  isStartTimeBegin: boolean;
  startAt: string;
}

export interface BlockedByMonitorAssessmentData {
  id: number;
  title: string;
  tabTitle: string;
  tabUrl: string;
  blocked: true;
}

export type FetchAssessmentData =
  | AssessmentData
  | UnauthenticatedAssessmentData
  | BlockedByMonitorAssessmentData;

export interface AssessmentDeleteResult {
  redirect: string;
}

export interface QuestionOrderPostData {
  question_order: QuestionData['id'][];
}

export type AssessmentUnlockRequirements = string[];

export interface AssessmentAuthenticationFormData {
  password: string;
}

export const isAuthenticatedAssessmentData = (
  data: FetchAssessmentData,
): data is AssessmentData =>
  (data as AssessmentData)?.permissions !== undefined;

export const isUnauthenticatedAssessmentData = (
  data: FetchAssessmentData,
): data is UnauthenticatedAssessmentData =>
  (data as UnauthenticatedAssessmentData)?.isAuthenticated !== undefined;

export const isBlockedByMonitorAssessmentData = (
  data: FetchAssessmentData,
): data is BlockedByMonitorAssessmentData =>
  (data as BlockedByMonitorAssessmentData)?.blocked === true;
